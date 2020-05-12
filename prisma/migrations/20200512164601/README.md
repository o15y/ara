# Migration `20200512164601`

This migration has been generated by Anand Chowdhary at 5/12/2020, 4:46:01 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE `ara_v2`.`meetings` ADD COLUMN `duration` int NOT NULL  ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200512155946..20200512164601
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource mysql {
   provider = "mysql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 enum Gender {
   MALE
@@ -127,19 +127,20 @@
 model locations {
   id             Int               @default(autoincrement()) @id
   type           MeetingType
-  data           Json?
+  data           String?
   value          String
   meetings       meetings[]        @relation("meetingLocation")
   organization   organizations     @relation("organizationLocations", fields: [organizationId], references: [id])
   organizationId Int
 }
 model meetings {
   id             Int               @default(autoincrement()) @id
-  proposedTimes  Json?
-  confirmedTime  Json?
+  proposedTimes  String?
+  confirmedTime  String?
+  duration       Int
   meetingType    MeetingType
   location       locations         @relation("meetingLocation", fields: [locationId], references: [id])
   locationId     Int
   user           users             @relation("userMeetings", fields: [userId], references: [id])
@@ -151,12 +152,12 @@
 model incoming_emails {
   id             Int           @default(autoincrement()) @id
   objectId       String        @unique
-  logs           Json?
-  from           Json
-  to             Json
-  cc             Json
+  logs           String?
+  from           String
+  to             String
+  cc             String
   subject        String
   status         EmailStatus   @default(PENDING)
   emailDate      DateTime
   messageId      String
```

