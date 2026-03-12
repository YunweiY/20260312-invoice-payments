-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'VOID');

-- CreateTable
CREATE TABLE "Customers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
