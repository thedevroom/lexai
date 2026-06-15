-- CreateIndex
CREATE UNIQUE INDEX "consent_records_userId_type_key" ON "consent_records"("userId", "type");