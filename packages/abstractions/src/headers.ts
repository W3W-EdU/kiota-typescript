
import { createRecordWithCaseInsensitiveKeys } from "./recordWithCaseInsensitiveKeys";

export class Headers extends Map<string, Set<string>> {

    private headers: Record<string, Set<string>> = createRecordWithCaseInsensitiveKeys<Set<string>>();
    private singleValueHeaders: Set<string> = new Set([
        "Content-Type",
        "Content-Encoding",
        "Content-Length"
    ]);

    constructor(entries?: readonly (readonly [string, Set<string>])[] | null) {
      super(entries);
      if (entries) {
          entries.forEach(([key, value]) => {
            this.headers[key] = value;
          });
      }
    }
    
    /**
     * Sets a header with the specified name and value. If a header with the same name already exists, its value is appended with the specified value.
     * @param headerName the name of the header to set
     * @param headerValue the value of the header to set
     * @returns Headers object
     */
    set(headerName: string, headerValue: Set<string>): this {
      this.add(headerName, ...headerValue);
      return this;
    }
    
    /**
     * Gets the values for the header with the specified name.
     * @param headerName The name of the header to get the values for.
     * @returns The values for the header with the specified name.
     * @throws Error if headerName is null or empty
     */
    get(headerName: string): Set<string> | undefined {
      if (!headerName) {
        throw new Error("headerName cannot be null or empty");
      }
      return this.headers[headerName];
    }
    
    /**
     * Checks if a header exists.
     * @param key The name of the header to check for.
     */
    has(key: string): boolean {
      return !!key && !!this.headers[key];;
    }
    
    /**
     * Delete the header with the specified name.
     * @param headerName The name of the header to delete.
     * @returns Whether or not the header existed and was deleted.
     * @throws Error if headerName is null or empty
     */
    delete(headerName: string): boolean {
      if (!headerName) {
        throw new Error("headerName cannot be null or empty");
      }
      if (this.headers[headerName]) {
        delete this.headers[headerName];
        return true;
      }
      return false;
    }
    
    /**
     * clear the headers collection
     */
    clear(): void {
      for (const header in this.headers) {
        delete this.headers[header];
      }
    }

    /**
     * execute a provided function once per each header
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each header in the dictionary.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: Set<string>, key: string, map: Map<string, Set<string>>) => void, thisArg?: any): void {
      for (const header in this.headers) {
        callbackfn.call(thisArg, this.headers[header], header, this);
      }
    }

    /**
     * Adds values to the header with the specified name.
     * @param headerName The name of the header to add values to.
     * @param headerValues The values to add to the header.
     * @returns Whether or not the values were added to the header.
     */
    add(headerName: string, ...headerValues: string[]): boolean {
      if (!headerName) {
        console.error("headerName cannot be null or empty");
        return false;
      }
      if (!headerValues) {
        console.error("headerValues cannot be null");
        return false;
      }
      if (headerValues.length === 0) {
        return false;
      }
      if (this.singleValueHeaders.has(headerName)) {
        this.headers[headerName] = new Set([headerValues[0]]);
      } else if (this.headers[headerName]) {
        headerValues.forEach(headerValue => this.headers[headerName].add(headerValue));
      } else {
        this.headers[headerName] = new Set(headerValues);
      }
      return true;
    }

    /**
     * Adds values to the header with the specified name if it's not already present
     * @param headerName The name of the header to add values to.
     * @param headerValue The values to add to the header.
     * @returns If the headerValue have been added to the Dictionary.
     */
    tryAdd(headerName: string, headerValue: string): boolean {
      if (!headerName) {
        throw new Error("headerName cannot be null or empty");
      }
      if (!headerValue) {
        throw new Error("headerValue cannot be null");
      }
      if (!this.headers[headerName]) {
        this.headers[headerName] = new Set([headerValue]);
        return true;
      }
      return false;
    }

    /**
     * Removes the specified value from the header with the specified name.
     * @param headerName The name of the header to remove the value from.
     * @param headerValue The value to remove from the header.
     * @returns Whether or not the header existed and was removed.
     * @throws Error if headerName is null or empty
     * @throws Error if headerValue is null
     */
    remove(headerName: string, headerValue: string): boolean {
      if (!headerName) {
        throw new Error("headerName cannot be null or empty");
      }
      if (!headerValue) {
        throw new Error("headerValue cannot be null");
      }
      if (this.headers[headerName]) {
        const result = this.headers[headerName].delete(headerValue);
        if (this.headers[headerName].size === 0) {
          delete this.headers[headerName];
        }
        return result;
      }
      return false;
    }

    /**
     * Adds all the headers values from the specified headers collection.
     * @param headers The headers to update the current headers with.
     * @throws Error if headers is null
     */
    addAll(headers: Headers): void {
      if (!headers) {
        throw new Error("headers cannot be null");
      }
      for (const header in headers.headers) {
        headers.headers[header].forEach(value => this.add(header, value));
      }
    }

    /**
     * Gets the values for the header with the specified name.
     * @param key The name of the header to get the values for.
     * @returns The values for the header with the specified name.
     * @throws Error if key is null or empty
     */
    tryGetValue(key: string): string[] | null {
      if (!key) {
        throw new Error("key cannot be null or empty");
      }
      return this.headers[key] ? Array.from(this.headers[key]) : null;
    }

    toString(): string {    
      return JSON.stringify(this.headers);
    }

    /**
     * check if the headers collection is empty
     */ 
    isEmpty(): boolean {
      return Object.keys(this.headers).length === 0;  
    }

    /**
     * get the headers collection size
     */
    keys(): IterableIterator<string> {
      return Object.keys(this.headers)[Symbol.iterator]();
    }

    /**
     * get entries
     */
    entries(): IterableIterator<[string, Set<string>]> {
      return Object.entries(this.headers)[Symbol.iterator]();
    }
}