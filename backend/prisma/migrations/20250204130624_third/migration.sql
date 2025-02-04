/*
  Warnings:

  - You are about to drop the column `followers` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `joined` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `trustScore` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `tweetsCount` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedClaims` on the `Influencer` table. All the data in the column will be lost.
  - You are about to drop the column `influencerId` on the `Tweet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[handle]` on the table `Influencer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[link]` on the table `Tweet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followerCount` to the `Influencer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingCount` to the `Influencer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `handle` to the `Influencer` table without a default value. This is not possible if the table is not empty.
  - Made the column `bio` on table `Influencer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `influencer_id` to the `Tweet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tweet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_influencerId_fkey";

-- DropIndex
DROP INDEX "Influencer_username_key";

-- AlterTable
ALTER TABLE "Claim" ALTER COLUMN "contentSource" SET DEFAULT 'Twitter',
ALTER COLUMN "trustScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Influencer" DROP COLUMN "followers",
DROP COLUMN "joined",
DROP COLUMN "profileImage",
DROP COLUMN "trustScore",
DROP COLUMN "tweetsCount",
DROP COLUMN "username",
DROP COLUMN "verifiedClaims",
ADD COLUMN     "followerCount" INTEGER NOT NULL,
ADD COLUMN     "followingCount" INTEGER NOT NULL,
ADD COLUMN     "handle" TEXT NOT NULL,
ADD COLUMN     "trustScoreHistory" DOUBLE PRECISION[],
ALTER COLUMN "bio" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "influencerId",
ADD COLUMN     "influencer_id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_handle_key" ON "Influencer"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Tweet_link_key" ON "Tweet"("link");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_influencer_id_fkey" FOREIGN KEY ("influencer_id") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
