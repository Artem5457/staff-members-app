/*
  Warnings:

  - You are about to alter the column `baseSalary` on the `StaffMember` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StaffMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "joinedDate" DATETIME NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "supervisorId" INTEGER,
    CONSTRAINT "StaffMember_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "StaffMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StaffMember" ("baseSalary", "email", "id", "joinedDate", "lastName", "name", "role", "supervisorId") SELECT "baseSalary", "email", "id", "joinedDate", "lastName", "name", "role", "supervisorId" FROM "StaffMember";
DROP TABLE "StaffMember";
ALTER TABLE "new_StaffMember" RENAME TO "StaffMember";
CREATE UNIQUE INDEX "StaffMember_email_key" ON "StaffMember"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
