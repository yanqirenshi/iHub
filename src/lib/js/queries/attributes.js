export function page_nation () { return `after: "", first: 100`; }

export function page_info () {
    return `endCursor
hasNextPage
hasPreviousPage
startCursor`;
}

export function ProjectV2ItemFieldIterationValue () {
    return `id
title
titleHTML
duration
iterationId
startDate
createdAt
updatedAt`;
}

export function ProjectV2ItemFieldNumberValue () {
    return `id
number
createdAt
updatedAt`;
}

export function ProjectV2ItemFieldSingleSelectValue () {
    return `id
name
nameHTML
optionId
createdAt
updatedAt`;
}

export function ProjectV2ItemFieldTextValue () {
    return `id
text
createdAt
updatedAt`;
}

export function projectV2FieldValue_Creator () {
    return `{
url
resourcePath
login
avatarUrl
... on User { id }
... on Organization { id }
... on Mannequin { id }
... on EnterpriseUserAccount { id }
... on Bot { id }
}`;
}

export function user () {
    return `id
login
name
avatarUrl
url
email
company
createdAt
updatedAt`;
}

export function repositories () {
    return `id
name
url
description
descriptionHTML
createdAt
updatedAt
pushedAt`;
}

export function issue () {
    return `id
url
title
createdAt
closedAt
updatedAt
number
body
bodyHTML`;
}

export function issue_comment (){
    return `id
url
body
bodyHTML
resourcePath
publishedAt
lastEditedAt
minimizedReason
isMinimized
includesCreatedEdit
databaseId
createdViaEmail
authorAssociation
createdAt
updatedAt`;
}

export function milestone () {
    return `id
url
title
state
number
dueOn`;
}

export function label () {
    return `id
name
url
color`;
}

export function project () {
    return `id
number
name
body
createdAt
updatedAt
closedAt
url`;
}

export function project_card () {
    return `id
url
note
state`;
}

export function project_column () {
    return `id
name`;
}

export function owner () {
    return `id
login
avatarUrl
url`;
}

export function project_next () {
    return `id
number
url
title
description
public
viewerCanUpdate
shortDescription
createdAt
updatedAt
closedAt
closed`;
}

export function projectv2 () {
    return `id
number
url
public
title
readme
resourcePath
shortDescription
viewerCanUpdate
closed
createdAt
updatedAt
closedAt`;
}

export function projectv2FieldIteration () {
    return `id
name
dataType
createdAt
updatedAt`;
}

export function projectv2FieldSelect () {
    return `id
name
dataType
createdAt
updatedAt`;
}

export function projectv2Field () {
    return `id
name
dataType
createdAt
updatedAt`;
}

export function project_next_fields () {
    return `id
name
dataType
settings
createdAt
updatedAt`;
}

export function project_next_item () {
    return `id
title
createdAt
updatedAt
isArchived
type`;
}

export function project_next_item_field_value () {
    return `id
createdAt
updatedAt
value`;
}

export function actor () {
    return `login
url
avatarUrl
resourcePath`;
}
