i have a question is it possible to create 1 common file ie
/root/travel_app/shared/components/common/EntityDetailsLayout.tsx
that is used for all 3 types of pages required for each feature
new.tsx
[id].tsx
[id]/edit.tsx

For new.tx page
When the user is creating a new record the entity details layout would load with all the fields blankj and the user can then eneter the details and then clic save whcih would then create the new record in the database.
The new.tsx page would have Cancel and Save buttons at the top
The order of the fields

[id].tsx (Read Only Page
When the user is on the read only poage for a record ID the entity details layout would load and all the records fields would have the saved information displayed in read only
The [id].tsx page would have Cancel and Save button and Delete Button at the top

[id]/edit.tsx (edit Page)
When the user is on theedit page page for a record ID the entity details layout would load and all the records fields would have the saved information displayed with the ability to edit the information int he fields
The [id].tsx page would have Cancel and Save button and at the top

The order of the fields
for new.tx page & [id]/edit.tsx (edit Page) the fields would be like this
Name
Description
Category (Applicable only to activities pages)
Type (Applicable only to Accommodation pages)
Destination (only applicable to Accommodation and Activity pages)
Status