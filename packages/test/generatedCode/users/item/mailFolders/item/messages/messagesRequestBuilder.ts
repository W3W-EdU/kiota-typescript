import {MessageCollectionResponse} from '../../../../../models/';
import {createMessageCollectionResponseFromDiscriminatorValue} from '../../../../../models/createMessageCollectionResponseFromDiscriminatorValue';
import {createMessageFromDiscriminatorValue} from '../../../../../models/createMessageFromDiscriminatorValue';
import {deserializeIntoMessage} from '../../../../../models/deserializeIntoMessage';
import type {Message} from '../../../../../models/message';
import {serializeMessage} from '../../../../../models/serializeMessage';
import {CountRequestBuilder} from './count/countRequestBuilder';
import {MessageItemRequestBuilder} from './item/messageItemRequestBuilder';
import {MessagesRequestBuilderGetRequestConfiguration} from './messagesRequestBuilderGetRequestConfiguration';
import {MessagesRequestBuilderPostRequestConfiguration} from './messagesRequestBuilderPostRequestConfiguration';
import {BaseRequestBuilder, HttpMethod, RequestInformation, getPathParameters} from '@microsoft/kiota-abstractions';
import type {Parsable, ParsableFactory, RequestAdapter, RequestOption} from '@microsoft/kiota-abstractions';

/**
 * Builds and executes requests for operations under /users/{user-id}/mailFolders/{mailFolder-id}/messages
 */
export class MessagesRequestBuilder extends BaseRequestBuilder {
    /**
     * The Count property
     */
    public get count(): CountRequestBuilder {
        return new CountRequestBuilder(this.pathParameters, this.requestAdapter);
    }
    /**
     * Gets an item from the ApiSdk.users.item.mailFolders.item.messages.item collection
     * @param messageId The unique identifier of message
     * @returns a MessageItemRequestBuilder
     */
    public byMessageId(messageId: string) : MessageItemRequestBuilder {
        if(!messageId) throw new Error("messageId cannot be undefined");
        const urlTplParams = getPathParameters(this.pathParameters);
        urlTplParams["message%2Did"] = messageId
        return new MessageItemRequestBuilder(urlTplParams, this.requestAdapter);
    };
    /**
     * Instantiates a new MessagesRequestBuilder and sets the default values.
     * @param pathParameters The raw url or the Url template parameters for the request.
     * @param requestAdapter The request adapter to use to execute the requests.
     */
    public constructor(pathParameters: Record<string, unknown> | string | undefined, requestAdapter: RequestAdapter) {
        super(pathParameters, requestAdapter, "{+baseurl}/users/{user%2Did}/mailFolders/{mailFolder%2Did}/messages{?%24top,%24skip,%24search,%24filter,%24count,%24orderby,%24select,%24expand}");
    };
    /**
     * Get all the messages in the specified user's mailbox, or those messages in a specified folder in the mailbox.
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns a Promise of MessageCollectionResponse
     * @see {@link https://learn.microsoft.com/graph/api/mailfolder-list-messages?view=graph-rest-1.0|Find more info here}
     */
    public get(requestConfiguration?: MessagesRequestBuilderGetRequestConfiguration | undefined) : Promise<MessageCollectionResponse | undefined> {
        const requestInfo = this.toGetRequestInformation(
            requestConfiguration
        );
        return this.requestAdapter.sendAsync<MessageCollectionResponse>(requestInfo, createMessageCollectionResponseFromDiscriminatorValue, undefined);
    };
    /**
     * Use this API to create a new Message in a mailfolder.
     * @param body The request body
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns a Promise of Message
     * @see {@link https://learn.microsoft.com/graph/api/mailfolder-post-messages?view=graph-rest-1.0|Find more info here}
     */
    public post(body: Message, requestConfiguration?: MessagesRequestBuilderPostRequestConfiguration | undefined) : Promise<Message | undefined> {
        const requestInfo = this.toPostRequestInformation(
            body, requestConfiguration
        );
        return this.requestAdapter.sendAsync<Message>(requestInfo, createMessageFromDiscriminatorValue, undefined);
    };
    /**
     * Get all the messages in the specified user's mailbox, or those messages in a specified folder in the mailbox.
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns a RequestInformation
     */
    public toGetRequestInformation(requestConfiguration?: MessagesRequestBuilderGetRequestConfiguration | undefined) : RequestInformation {
        const requestInfo = new RequestInformation();
        requestInfo.urlTemplate = this.urlTemplate;
        requestInfo.pathParameters = this.pathParameters;
        requestInfo.httpMethod = HttpMethod.GET;
        requestInfo.headers["Accept"] = ["application/json"];
        if (requestConfiguration) {
            requestInfo.addRequestHeaders(requestConfiguration.headers);
            requestInfo.setQueryStringParametersFromRawObject(requestConfiguration.queryParameters);
            requestInfo.addRequestOptions(requestConfiguration.options);
        }
        return requestInfo;
    };
    /**
     * Use this API to create a new Message in a mailfolder.
     * @param body The request body
     * @param requestConfiguration Configuration for the request such as headers, query parameters, and middleware options.
     * @returns a RequestInformation
     */
    public toPostRequestInformation(body: Message, requestConfiguration?: MessagesRequestBuilderPostRequestConfiguration | undefined) : RequestInformation {
        if(!body) throw new Error("body cannot be undefined");
        const requestInfo = new RequestInformation();
        requestInfo.urlTemplate = this.urlTemplate;
        requestInfo.pathParameters = this.pathParameters;
        requestInfo.httpMethod = HttpMethod.POST;
        requestInfo.headers["Accept"] = ["application/json"];
        if (requestConfiguration) {
            requestInfo.addRequestHeaders(requestConfiguration.headers);
            requestInfo.addRequestOptions(requestConfiguration.options);
        }
        requestInfo.setContentFromParsable(this.requestAdapter, "application/json", body, serializeMessage);
        return requestInfo;
    };
}
