// Stubs for future Amazon PA-API integration. Do not call external APIs now.
// TODO: Implement PA-API client when price/availability is added.

export interface AmazonImage {
  url: string;
  width: number;
  height: number;
}

export interface AmazonProductSummary {
  asin: string;
  title: string;
  brand?: string;
  images: AmazonImage[];
  detailPageUrl?: string;
}

export interface AmazonPriceInfo {
  amount: number;
  currency: string;
  display: string;
}

export async function fetchProductSummary(/* asin: string */): Promise<AmazonProductSummary> {
  throw new Error('Not implemented');
}

export async function fetchPrices(/* asins: string[] */): Promise<Record<string, AmazonPriceInfo>> {
  throw new Error('Not implemented');
}


