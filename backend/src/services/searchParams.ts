import { registry } from "zod/v4";
import { HttpError } from "../middleware/errorHandler";
import type { SearchParams, SearchCursor, SortOrder } from "./searchService";

const SortOrders: SortOrder[] = ['recommended', 'price_asc', 'price_desc', 'rating'];
const settings: string[] = ['beach', 'city', 'safari', 'mountain', 'countryside'];

const MAX_NIGHTS = 30;
const MAX_PRICE_RAND = 1000000;
const MAX_TEXT_LENGTH = 80;

function fail(message: string): HttpError{
    return new HttpError(400, 'VALIDATION_ERROR', message);
}

function readText(value: unknown): string | null {
    if (typeof value !== 'string'){
        return null;
    }
    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}

function readInteger(value: unknown, name: string, min: number, max: number): number | null {
    const text = readText(value);

    if (text === null){
        return null;
    }

    const number = Number(text);
    if(!Number.isInteger(number) || number < min || number > max){
        throw fail(`${name} must be a whole number from ${min} to ${max}`);
    }
    return number;
}

function readDate(value: unknown, name: string): string | null {
    const text = readText(value);

    if (text === null){
        return null;
    }

    const parsed = new Date(`${text}T00:00:00Z`);
   
    const looksRight = /^\d{4}-\d{2}-\d{2}$/.test(text);

    if (!looksRight || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text){
        throw fail(`${name} must be a real date written as YYYY-MM-DD`)
    }
    return text;
}

function readStars(value: unknown): number | null{
    const text = readText(value);
    if (text === null){
        return null;
    }
    const number = Number(text);

    if (Number.isNaN(number) || number < 1 || number > 5 || (number * 2) % 1 !== 0 ){
        throw fail('stars must be 1, 1.5, 2 and so on up to 5');
    }
    return number;
}

function readAmenityIds(value: unknown): number[]{
    const text = readText(value);
    if (text === null){
        return [];
    }
    const ids: number[] = [];

    for (const part of text.split(',')){
        const id = Number(part);
        if (!Number.isInteger(id) || id < 1){
            throw fail('amenityIds must be a comma separated list of ids');
        }
        if (!ids.includes(id)){
            ids.push(id);
        }
    }
    if (ids.length > 20){
        throw fail('Too many amenties selected');
    }
    return ids;
}

function readCursor(value: unknown): SearchCursor | null {
    const text = readText(value);

    if (text === null){
        return null;
    }
    try{
        const decoded = JSON.parse(Buffer.from(text, 'base64url').toString('utf-8'));

        
        const valueOk = typeof decoded.v === 'string' && /^-?\d+(\.\d+)?\$/.test(decoded.v);

        const idOk = Number.isInteger(decoded.id) && decoded.id > 0;

        if (valueOk && idOk){
            return {value: decoded.v, id: decoded.id};
        }
    }catch{
       
    }
    throw fail('cursor is not valid');
}

function nightsBetween(checkIn: string, checkOut: string): number{
  
    const start = Date.parse(`${checkIn}T00:00:00Z`);
    const end = Date.parse(`${checkOut}T00:00:00Z`);

    return Math.round((end - start) / 86400000);
}

export function parseSearchQuery(query: Record<string, unknown>): SearchParams{
    const text = readText(query.city);

    if (text !== null && text.length > MAX_TEXT_LENGTH){
        throw fail('city is too long');
    }

    const checkIn = readDate(query.checkIn, 'checkIn');
    const checkOut = readDate(query.checkOut, 'checkOut');

    if ((checkIn !== null) !== (checkOut !== null)){
        throw fail('Send both checkIn and checkOut, or neither');
    }

    if (checkIn !== null && checkOut !== null){

        const nights = nightsBetween(checkIn, checkOut);

        if (nights < 1){
            throw fail('checkOut must be after checkIn');
        }
        if (nights > MAX_NIGHTS){
            throw fail(`Stays are limited to ${MAX_NIGHTS} nights`);
        }
    }

    const adults = readInteger(query.adults, 'adults', 1, 20) ?? 2;
    const children = readInteger(query.children, 'children', 0, 10) ?? 0;
    const rooms = readInteger(query.rooms, 'rooms', 1, 5) ?? 1;

    if (rooms > adults){
        throw fail('At least one adult is needed per room');
    }


    const minPrice = readInteger(query.minPrice, 'minPrice', 0, MAX_PRICE_RAND);
    const maxPrice =  readInteger(query.maxPrice, 'maxPrice', 0, MAX_PRICE_RAND);

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice){
        throw fail('minPrice cannot be more than maxPrice');
    }

    const settingText = readText(query.setting);

    if (settingText !== null && !settings.includes(settingText)){
        throw fail('setting is not a known property type');
    }

    const sortText = readText(query.sort) ?? 'recommended';

    const sort = SortOrders.find((option) => option === sortText);

    if (sort == undefined){
        throw fail(`sort must be one of ${SortOrders.join(', ')}`);
    }

    return{
        text: text,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: adults,
        children: children,
        rooms: rooms,
        minPriceCents: minPrice == null ? null : minPrice * 100,
        maxPriceCents: maxPrice == null ? null : maxPrice * 100,
        minStars: readStars(query.stars),
        setting: settingText,
        amenityIds: readAmenityIds(query.amenityIds),
        sort: sort,
        cursor: readCursor(query.cursor),
    };
}
