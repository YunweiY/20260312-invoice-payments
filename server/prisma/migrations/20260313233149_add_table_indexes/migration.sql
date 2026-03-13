-- CreateIndex
CREATE INDEX "Invoices_customer_id_issued_at_idx" ON "Invoices"("customer_id", "issued_at" DESC);

-- CreateIndex
CREATE INDEX "Invoices_status_issued_at_idx" ON "Invoices"("status", "issued_at" DESC);

-- CreateIndex
CREATE INDEX "Invoices_issued_at_idx" ON "Invoices"("issued_at" DESC);

-- CreateIndex
CREATE INDEX "Payments_invoice_id_paid_at_idx" ON "Payments"("invoice_id", "paid_at" DESC);

-- CreateIndex
CREATE INDEX "Payments_paid_at_idx" ON "Payments"("paid_at" DESC);
