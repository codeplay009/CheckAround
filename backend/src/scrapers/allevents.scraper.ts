import axios from "axios";

import * as cheerio from "cheerio";

import { EventPrice, EventType } from "../types/event.types";

const normalizeText = (value: string) =>
  value
    .replace(/\u00e2\u20ac\u00a2|\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a2|\u2022/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const titleCaseSlug = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const cityFromEventUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  try {
    const citySlug = new URL(url).pathname.split("/").filter(Boolean)[0];
    return citySlug ? titleCaseSlug(citySlug) : undefined;
  } catch {
    return undefined;
  }
};

const parsePrice = (priceText: string): EventPrice | undefined => {
  const displayText = normalizeText(priceText);

  if (!displayText) {
    return undefined;
  }

  if (/free/i.test(displayText)) {
    return { displayText, isFree: true };
  }

  const amountMatch = displayText.match(
    /^(?<currency>[A-Z]{3}|Rs\.?|INR|USD|EUR|GBP|\$|\u20ac|\u00a3)?\s*(?<amount>[\d,.]+)/i,
  );

  if (!amountMatch?.groups) {
    return { displayText };
  }

  const amount = Number(amountMatch.groups.amount.replace(/,/g, ""));
  const currency = amountMatch.groups.currency?.replace(/\.$/, "").toUpperCase();

  return {
    displayText,
    currency,
    minAmount: Number.isFinite(amount) ? amount : undefined,
  };
};

const parseInterestedCount = (text: string) => {
  const match = normalizeText(text).match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
};

export const parseAllEventsHtml = (html: string): EventType[] => {
  const $ = cheerio.load(html);
  const scrapedAt = new Date().toISOString();
  const events: EventType[] = [];

  $("li.event-card").each((_, el) => {
    const card = $(el);
    const sourceUrl = card.attr("data-link") || card.find(".title a").attr("href");
    const title =
      normalizeText(card.attr("data-name") || "") ||
      normalizeText(card.find(".title h3").text());
    const dateText = normalizeText(card.find(".date").first().text());
    const venueName = normalizeText(card.find(".location").first().text());
    const priceText = normalizeText(card.find(".price span").last().text());
    const interestedText = normalizeText(card.find(".interested").text());
    const attendeeAvatars = card
      .find(".avatar-img")
      .map((_, avatar) => $(avatar).attr("data-src") || $(avatar).attr("src") || "")
      .get()
      .filter(Boolean);
    const imageUrl =
      card.find(".banner-cont").attr("data-src") ||
      card.find(".banner-cont").attr("data-original") ||
      undefined;
    const city = cityFromEventUrl(sourceUrl);

    if (!title) {
      return;
    }

    events.push({
      id: card.attr("data-eid"),
      origin: "supplementary",
      title,
      dateText,
      source: "allevents",
      sourceUrl,
      imageUrl,
      location: {
        venueName,
        city,
        isOnline: city?.toLowerCase() === "online",
      },
      price: parsePrice(priceText),
      popularity: {
        interestedCount: parseInterestedCount(interestedText),
        attendeeAvatars,
        isFeatured: card.find(".c-ribbon").text().toLowerCase().includes("featured"),
      },
      scrapedAt,
    });
  });

  return events;
};

export const scrapeAllEvents = async (): Promise<EventType[]> => {
  const response = await axios.get("https://allevents.in/india");

  return parseAllEventsHtml(response.data);
};
