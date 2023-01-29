import {deserializeIntoEntity} from './deserializeIntoEntity';
import {Attachment} from './index';
import {DeserializeIntoModelFunction, Parsable, ParseNode, SerializationWriter} from '@microsoft/kiota-abstractions';

export function deserializeIntoAttachment(attachment: Attachment | undefined = {}) : Record<string, (node: ParseNode) => void> {
    return {
        ...deserializeIntoEntity(attachment),
        "contentType": n => { attachment.contentType = n.getStringValue(); },
        "isInline": n => { attachment.isInline = n.getBooleanValue(); },
        "lastModifiedDateTime": n => { attachment.lastModifiedDateTime = n.getDateValue(); },
        "name": n => { attachment.name = n.getStringValue(); },
        "size": n => { attachment.size = n.getNumberValue(); },
    }
}