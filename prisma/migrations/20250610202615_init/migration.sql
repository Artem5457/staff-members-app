-- CreateTable
CREATE TABLE "StaffMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "joinedDate" DATETIME NOT NULL,
    "baseSalary" REAL NOT NULL,
    "role" TEXT NOT NULL,
    "supervisorId" INTEGER,
    CONSTRAINT "StaffMember_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "StaffMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
