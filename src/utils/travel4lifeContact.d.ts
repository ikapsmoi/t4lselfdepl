export type Travel4LifeContactPageType =
  | 'travel'
  | 'jim-corbett'
  | 'cost'
  | 'activities'
  | 'resort'
  | 'package'
  | 'wedding'
  | 'mice'
  | 'corporate'
  | 'safari'
  | 'origin'
  | 'europe'
  | 'festival';

export interface Travel4LifeContactContext {
  pageType?: Travel4LifeContactPageType;
  destination?: string;
  country?: string;
  city?: string;
  resort?: string;
  package?: string;
  eventType?: string;
  tripType?: string;
  origin?: string;
  entity?: string;
}

export const TRAVEL4LIFE_CONTACT: {
  readonly phone: string;
  readonly phoneHref: string;
  readonly whatsappNumber: string;
  readonly email: string;
};

export function getTravel4LifeContactContext(context?: Travel4LifeContactContext): Required<Pick<Travel4LifeContactContext, 'pageType'>> & Travel4LifeContactContext;
export function getTravel4LifeWhatsAppMessage(context?: Travel4LifeContactContext): string;
export function getTravel4LifeWhatsAppUrl(context?: Travel4LifeContactContext, message?: string): string;
export function getTravel4LifeContactContextFromLocation(pathname: string, title?: string): Travel4LifeContactContext;
export function getTravel4LifeQuoteEvent(pageType?: string): string;
export function getTravel4LifeQuoteEvents(pageType?: string): string[];
