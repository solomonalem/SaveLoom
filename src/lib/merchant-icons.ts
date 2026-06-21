/** Resolve merchant names/descriptions to brand domains for logo lookup */

type MerchantEntry = { match: RegExp; domain: string };

const MERCHANTS: MerchantEntry[] = [
  // Rides & delivery
  { match: /\buber\b|\bubr[\s*]/i, domain: "uber.com" },
  { match: /\blyft\b/i, domain: "lyft.com" },
  { match: /\bdoordash\b|\bdd[\s*]/i, domain: "doordash.com" },
  { match: /\bgrubhub\b/i, domain: "grubhub.com" },
  { match: /\bpostmates\b/i, domain: "postmates.com" },
  { match: /\bubereats\b|\buber eats\b/i, domain: "ubereats.com" },
  { match: /\binstacart\b/i, domain: "instacart.com" },
  { match: /\bseamless\b/i, domain: "seamless.com" },

  // Streaming & subscriptions
  { match: /\bnetflix\b/i, domain: "netflix.com" },
  { match: /\bspotify\b/i, domain: "spotify.com" },
  { match: /\bhulu\b/i, domain: "hulu.com" },
  { match: /\bdisney\+?\b|\bdisney plus\b/i, domain: "disneyplus.com" },
  { match: /\bhbomax\b|\bhbo max\b|\bmax\.com\b/i, domain: "max.com" },
  { match: /\bprime video\b|\bamazon prime\b/i, domain: "amazon.com" },
  { match: /\bapple\.com\/bill\b|\bapple music\b|\bapple tv\b|\bitunes\b/i, domain: "apple.com" },
  { match: /\byoutube premium\b|\byoutube\b/i, domain: "youtube.com" },
  { match: /\baudible\b/i, domain: "audible.com" },
  { match: /\bparamount\+?\b/i, domain: "paramountplus.com" },
  { match: /\bpeacock\b/i, domain: "peacocktv.com" },
  { match: /\btwitch\b/i, domain: "twitch.tv" },
  { match: /\bxbox\b|\bmicrosoft\b|\bxbox game pass\b/i, domain: "xbox.com" },
  { match: /\bplaystation\b|\bpsn\b/i, domain: "playstation.com" },
  { match: /\bnintendo\b/i, domain: "nintendo.com" },
  { match: /\bopenai\b|\bchatgpt\b/i, domain: "openai.com" },
  { match: /\bnotion\b/i, domain: "notion.so" },
  { match: /\bslack\b/i, domain: "slack.com" },
  { match: /\bzoom\b/i, domain: "zoom.us" },
  { match: /\bdropbox\b/i, domain: "dropbox.com" },
  { match: /\badobe\b/i, domain: "adobe.com" },
  { match: /\bgithub\b/i, domain: "github.com" },

  // Retail & e-commerce
  { match: /\bamazon\b|\bamzn\b|\bamazon\.com\b|\bamazon mktp\b/i, domain: "amazon.com" },
  { match: /\bwalmart\b|\bwal-mart\b/i, domain: "walmart.com" },
  { match: /\btarget\b|\btgt\b/i, domain: "target.com" },
  { match: /\bcostco\b/i, domain: "costco.com" },
  { match: /\bbest buy\b|\bbestbuy\b/i, domain: "bestbuy.com" },
  { match: /\bhome depot\b/i, domain: "homedepot.com" },
  { match: /\blowe'?s\b/i, domain: "lowes.com" },
  { match: /\betsy\b/i, domain: "etsy.com" },
  { match: /\bebay\b/i, domain: "ebay.com" },
  { match: /\bshein\b/i, domain: "shein.com" },
  { match: /\btemu\b/i, domain: "temu.com" },
  { match: /\bnike\b/i, domain: "nike.com" },
  { match: /\badidas\b/i, domain: "adidas.com" },
  { match: /\bapple store\b|\bapple\.com\b/i, domain: "apple.com" },
  { match: /\bsephora\b/i, domain: "sephora.com" },
  { match: /\bulta\b/i, domain: "ulta.com" },
  { match: /\bwayfair\b/i, domain: "wayfair.com" },
  { match: /\bshopify\b/i, domain: "shopify.com" },

  // Groceries
  { match: /\bwhole foods\b/i, domain: "wholefoodsmarket.com" },
  { match: /\btrader joe\b/i, domain: "traderjoes.com" },
  { match: /\bkroger\b/i, domain: "kroger.com" },
  { match: /\bsafeway\b/i, domain: "safeway.com" },
  { match: /\baldi\b/i, domain: "aldi.us" },
  { match: /\bwegmans\b/i, domain: "wegmans.com" },
  { match: /\bpublix\b/i, domain: "publix.com" },
  { match: /\bheb\b/i, domain: "heb.com" },

  // Food & coffee
  { match: /\bstarbucks\b|\bsbx\b/i, domain: "starbucks.com" },
  { match: /\bdunkin\b/i, domain: "dunkindonuts.com" },
  { match: /\bmcdonald\b|\bmcd\b/i, domain: "mcdonalds.com" },
  { match: /\bchipotle\b/i, domain: "chipotle.com" },
  { match: /\bsubway\b/i, domain: "subway.com" },
  { match: /\btaco bell\b/i, domain: "tacobell.com" },
  { match: /\bwendy'?s\b/i, domain: "wendys.com" },
  { match: /\bburger king\b/i, domain: "bk.com" },
  { match: /\bdomino'?s\b/i, domain: "dominos.com" },
  { match: /\bpizza hut\b/i, domain: "pizzahut.com" },
  { match: /\bpanera\b/i, domain: "panerabread.com" },
  { match: /\bshake shack\b/i, domain: "shakeshack.com" },
  { match: /\bchick-fil-a\b|\bchick fil a\b/i, domain: "chick-fil-a.com" },
  { match: /\bwingstop\b/i, domain: "wingstop.com" },
  { match: /\bkrispy kreme\b/i, domain: "krispykreme.com" },

  // Transportation & travel
  { match: /\bshell\b|\bchevron\b|\bexxon\b|\bbp\b|\b76\b|\barco\b|\bspeedway\b/i, domain: "shell.com" },
  { match: /\bairbnb\b/i, domain: "airbnb.com" },
  { match: /\bbooking\.com\b/i, domain: "booking.com" },
  { match: /\bexpedia\b/i, domain: "expedia.com" },
  { match: /\bhotels\.com\b/i, domain: "hotels.com" },
  { match: /\bunited airlines\b|\bunited\.com\b/i, domain: "united.com" },
  { match: /\bdelta air\b|\bdelta\.com\b/i, domain: "delta.com" },
  { match: /\bamerican airlines\b/i, domain: "aa.com" },
  { match: /\bsouthwest\b/i, domain: "southwest.com" },
  { match: /\bjetblue\b/i, domain: "jetblue.com" },
  { match: /\benterprise rent\b|\bhertz\b|\bavis\b/i, domain: "enterprise.com" },

  // Payments & finance
  { match: /\bpaypal\b/i, domain: "paypal.com" },
  { match: /\bvenmo\b/i, domain: "venmo.com" },
  { match: /\bcash app\b|\bsquare cash\b/i, domain: "cash.app" },
  { match: /\bzelle\b/i, domain: "zellepay.com" },
  { match: /\bchase\b|\bjpmorgan\b|\bjpm\b/i, domain: "chase.com" },
  { match: /\bbank of america\b|\bbofa\b/i, domain: "bankofamerica.com" },
  { match: /\bwells fargo\b/i, domain: "wellsfargo.com" },
  { match: /\bciti\b|\bcitibank\b/i, domain: "citi.com" },
  { match: /\bcapital one\b/i, domain: "capitalone.com" },
  { match: /\bamerican express\b|\bamex\b/i, domain: "americanexpress.com" },
  { match: /\bdiscover\b/i, domain: "discover.com" },
  { match: /\bvisa\b/i, domain: "visa.com" },
  { match: /\bmastercard\b/i, domain: "mastercard.com" },
  { match: /\brobinhood\b/i, domain: "robinhood.com" },
  { match: /\bfidelity\b/i, domain: "fidelity.com" },
  { match: /\bvanguard\b/i, domain: "vanguard.com" },
  { match: /\bcoinbase\b/i, domain: "coinbase.com" },

  // Utilities & telecom
  { match: /\bat&t\b|\batt\b/i, domain: "att.com" },
  { match: /\bverizon\b/i, domain: "verizon.com" },
  { match: /\bt-mobile\b|\btmobile\b/i, domain: "t-mobile.com" },
  { match: /\bcomcast\b|\bxfinity\b/i, domain: "xfinity.com" },
  { match: /\bspectrum\b/i, domain: "spectrum.com" },
  { match: /\bpg&e\b|\bduke energy\b|\bcon ed\b/i, domain: "pge.com" },

  // Health & pharmacy
  { match: /\bcvs\b/i, domain: "cvs.com" },
  { match: /\bwalgreens\b/i, domain: "walgreens.com" },
  { match: /\brite aid\b/i, domain: "riteaid.com" },
  { match: /\bkaiser\b/i, domain: "kaiserpermanente.org" },

  // Tech & cloud
  { match: /\bgoogle\b|\bgoogle cloud\b|\bgoogle one\b/i, domain: "google.com" },
  { match: /\bmicrosoft\b|\bmsft\b/i, domain: "microsoft.com" },
  { match: /\baws\b|\bamazon web services\b/i, domain: "aws.amazon.com" },

  // Social
  { match: /\bmeta\b|\bfacebook\b|\binstagram\b/i, domain: "meta.com" },
  { match: /\btwitter\b|\bx\.com\b/i, domain: "x.com" },
  { match: /\blinkedin\b/i, domain: "linkedin.com" },
  { match: /\btiktok\b/i, domain: "tiktok.com" },
  { match: /\bsnapchat\b/i, domain: "snapchat.com" },

  // Fitness
  { match: /\bpeloton\b/i, domain: "onepeloton.com" },
  { match: /\bplanet fitness\b/i, domain: "planetfitness.com" },
  { match: /\bclasspass\b/i, domain: "classpass.com" },
];

const BANK_DOMAINS: MerchantEntry[] = [
  { match: /\bchase\b/i, domain: "chase.com" },
  { match: /\bbank of america\b/i, domain: "bankofamerica.com" },
  { match: /\bwells fargo\b/i, domain: "wellsfargo.com" },
  { match: /\bcapital one\b/i, domain: "capitalone.com" },
  { match: /\bciti\b/i, domain: "citi.com" },
  { match: /\bus bank\b/i, domain: "usbank.com" },
  { match: /\btd bank\b/i, domain: "td.com" },
  { match: /\bpnc\b/i, domain: "pnc.com" },
  { match: /\bally\b/i, domain: "ally.com" },
  { match: /\bmarcus\b/i, domain: "marcus.com" },
  { match: /\bsofi\b/i, domain: "sofi.com" },
];

export function resolveMerchantDomain(
  merchantName?: string | null,
  description?: string | null,
): string | null {
  const combined = [merchantName, description].filter(Boolean).join(" ").trim();
  if (!combined) return null;

  for (const entry of MERCHANTS) {
    if (entry.match.test(combined)) return entry.domain;
  }

  return null;
}

export function resolveBankDomain(bankName?: string | null): string | null {
  if (!bankName?.trim()) return null;

  for (const entry of BANK_DOMAINS) {
    if (entry.match.test(bankName)) return entry.domain;
  }

  return null;
}

/** Google favicon service — single host, works for most brand domains */
export function getMerchantLogoUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function getMerchantDisplayName(
  merchantName?: string | null,
  description?: string | null,
): string {
  return (merchantName || description || "Unknown").trim();
}
