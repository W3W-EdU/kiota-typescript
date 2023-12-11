import { getPathParameters } from "./getPathParameters";
import { HttpMethod } from "./httpMethod";
import type { RequestAdapter } from "./requestAdapter";
import type { RequestConfiguration } from "./requestConfiguration";
import { RequestInformation } from "./requestInformation";
import type {
  ModelSerializerFunction,
  Parsable,
  ParsableFactory,
} from "./serialization";

function getRequestMetadata(
  key: string,
  metadata: Record<string, RequestMetadata>,
): RequestMetadata {
  if (!metadata) throw new Error("couldn't find request metadata");
  if (key.startsWith("to")) {
    key = key.substring(2).replace("RequestInformation", "").toLowerCase();
  }
  const value = metadata[key];
  if (!value) throw new Error("couldn't find request metadata");
  return value;
}

function toGetRequestInformation<QueryParametersType extends object>(
  urlTemplate: string,
  pathParameters: Record<string, unknown>,
  metadata: RequestMetadata,
  requestConfiguration?: RequestConfiguration<QueryParametersType> | undefined,
): RequestInformation {
  const requestInfo = new RequestInformation(
    HttpMethod.GET,
    urlTemplate,
    pathParameters,
  );
  requestInfo.configure(requestConfiguration, metadata.queryParametersMapper);
  addAcceptHeaderIfPresent(metadata, requestInfo);
  return requestInfo;
}

function toPostRequestInformation<QueryParametersType extends object>(
  urlTemplate: string,
  pathParameters: Record<string, unknown>,
  metadata: RequestMetadata,
  requestAdapter: RequestAdapter,
  body: unknown,
  requestConfiguration?: RequestConfiguration<QueryParametersType> | undefined,
): RequestInformation {
  if (!body) throw new Error("body cannot be undefined");
  const requestInfo = new RequestInformation(
    HttpMethod.POST,
    urlTemplate,
    pathParameters,
  );
  requestInfo.configure(requestConfiguration);
  addAcceptHeaderIfPresent(metadata, requestInfo);
  if (metadata.requestBodyContentType && metadata.requestBodySerializer) {
    requestInfo.setContentFromParsable(
      requestAdapter,
      metadata.requestBodyContentType,
      body,
      metadata.requestBodySerializer,
    );
  }
  return requestInfo;
}
function addAcceptHeaderIfPresent(
  metadata: RequestMetadata,
  requestInfo: RequestInformation,
): void {
  if (metadata.responseBodyContentType) {
    requestInfo.headers.tryAdd("Accept", metadata.responseBodyContentType);
  }
}
function getRequestConfigurationValue(
  requestMetadata: RequestMetadata,
  args: any[],
) {
  if (args.length > 1 && requestMetadata.requestBodySerializer) {
    return args[1];
  } else if (args.length > 0 && !requestMetadata.requestBodySerializer) {
    return args[0];
  }
  return undefined;
}
export function apiClientProxifier<T extends object>(
  requestAdapter: RequestAdapter,
  pathParameters: Record<string, unknown>,
  urlTemplate: string,
  navigationMetadata?: Record<string, NavigationMetadata>,
  requestsMetadata?: Record<string, RequestMetadata>,
): T {
  if (!requestAdapter) throw new Error("requestAdapter cannot be undefined");
  if (!pathParameters) throw new Error("pathParameters cannot be undefined");
  if (!urlTemplate) throw new Error("urlTemplate cannot be undefined");
  return new Proxy({} as T, {
    get(target, property) {
      const name = String(property);
      if (name === "withUrl") {
        return (rawUrl: string) => {
          if (!rawUrl) throw new Error("rawUrl cannot be undefined");
          return apiClientProxifier(
            requestAdapter,
            getPathParameters(rawUrl),
            urlTemplate,
            navigationMetadata,
            requestsMetadata,
          );
        };
      }
      if (requestsMetadata) {
        const metadata = getRequestMetadata(name, requestsMetadata);
        switch (name) {
          case "get":
            return <ReturnType extends Parsable>(
              requestConfiguration?: RequestConfiguration<object> | undefined,
            ): Promise<ReturnType | undefined> => {
              const requestInfo = toGetRequestInformation(
                urlTemplate,
                pathParameters,
                metadata,
                requestConfiguration,
              );
              if (!metadata.responseBodyFactory) {
                throw new Error("couldn't find response body factory");
              }
              return requestAdapter.sendAsync<ReturnType>( //TODO switch the request adapter method based on the metadata
                requestInfo,
                metadata.responseBodyFactory,
                metadata.errorMappings,
              );
            };
          case "patch":
          case "put":
          case "delete":
            break;
          case "post":
            return <ReturnType extends Parsable>(
              body: unknown,
              requestConfiguration?: RequestConfiguration<object> | undefined,
            ): Promise<ReturnType | undefined> => {
              const requestInfo = toPostRequestInformation(
                urlTemplate,
                pathParameters,
                metadata,
                requestAdapter,
                body,
                requestConfiguration,
              );
              if (!metadata.responseBodyFactory) {
                throw new Error("couldn't find response body factory");
              }
              return requestAdapter.sendAsync<ReturnType>( //TODO switch the request adapter method based on the metadata
                requestInfo,
                metadata.responseBodyFactory,
                metadata.errorMappings,
              );
            };
          case "toGetRequestInformation":
            return (requestConfiguration?: RequestConfiguration<object>) => {
              return toGetRequestInformation(
                urlTemplate,
                pathParameters,
                metadata,
                requestConfiguration,
              );
            };
          case "toPatchRequestInformation":
          case "toPutRequestInformation":
          case "toDeleteRequestInformation":
            break;
          case "toPostRequestInformation":
            return (...args: any[]) => {
              return toPostRequestInformation(
                urlTemplate,
                pathParameters,
                metadata,
                requestAdapter,
                args.length > 0 ? args[0] : undefined,
                getRequestConfigurationValue(metadata, args),
              );
            };
          default:
            break;
        }
      }
      if (navigationMetadata) {
        const navigationCandidate = navigationMetadata[name];
        if (navigationCandidate) {
          if (
            !navigationCandidate.pathParametersMappings ||
            navigationCandidate.pathParametersMappings.length === 0
          ) {
            // navigation property
            return apiClientProxifier(
              requestAdapter,
              getPathParameters(pathParameters),
              navigationCandidate.uriTemplate,
              navigationCandidate.navigationMetadata,
              navigationCandidate.requestsMetadata,
            );
          }
          return (...argArray: any[]) => {
            // navigation method like indexers or multiple path parameters
            const downWardPathParameters = getPathParameters(pathParameters);
            if (
              navigationCandidate.pathParametersMappings &&
              navigationCandidate.pathParametersMappings.length > 0
            ) {
              for (let i = 0; i < argArray.length; i++) {
                const element = argArray[i];
                downWardPathParameters[
                  navigationCandidate.pathParametersMappings[i]
                ] = element;
              }
            }
            return apiClientProxifier(
              requestAdapter,
              downWardPathParameters,
              navigationCandidate.uriTemplate,
              navigationCandidate.navigationMetadata,
              navigationCandidate.requestsMetadata,
            );
          };
        }
      }
    },
  });
}

export interface RequestMetadata {
  requestBodyContentType?: string;
  responseBodyContentType?: string;
  errorMappings?: Record<string, ParsableFactory<Parsable>>;
  adapterMethodName?: keyof RequestAdapter;
  responseBodyFactory?: ParsableFactory<Parsable>; // TODO primitive types
  requestBodySerializer?: ModelSerializerFunction<Parsable>;
  queryParametersMapper?: Record<string, string>;
}

export interface NavigationMetadata {
  uriTemplate: string;
  requestsMetadata?: Record<string, RequestMetadata>;
  navigationMetadata?: Record<string, NavigationMetadata>;
  pathParametersMappings?: string[];
}