/*
  Warnings:

  - The values [owner,admin] on the enum `StaffRole` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `owner_id` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffRole_new" AS ENUM ('manager', 'staff');
ALTER TABLE "user_restaurants" ALTER COLUMN "staff_role" TYPE "StaffRole_new" USING ("staff_role"::text::"StaffRole_new");
ALTER TYPE "StaffRole" RENAME TO "StaffRole_old";
ALTER TYPE "StaffRole_new" RENAME TO "StaffRole";
DROP TYPE "public"."StaffRole_old";
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'owner';

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "owner_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
