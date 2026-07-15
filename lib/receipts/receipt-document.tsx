import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReceiptData } from "@/lib/queries/receipts-queries";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  logo: { width: 56, height: 56, objectFit: "contain" },
  instituteName: { fontSize: 16, fontWeight: 700 },
  instituteEmail: { fontSize: 9, color: "#64748b", marginTop: 2 },
  receiptMeta: { alignItems: "flex-end" },
  receiptTitle: { fontSize: 14, fontWeight: 700, color: "#2563eb" },
  receiptNumber: { fontSize: 10, color: "#64748b", marginTop: 4 },
  receiptDate: { fontSize: 10, color: "#64748b", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginVertical: 16 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 8, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rowLabel: { color: "#64748b" },
  rowValue: { fontWeight: 700 },
  amountBox: { backgroundColor: "#eff6ff", borderRadius: 6, padding: 16, marginVertical: 16 },
  amountLabel: { fontSize: 9, color: "#2563eb" },
  amountValue: { fontSize: 24, fontWeight: 700, color: "#1e3a8a", marginTop: 4 },
  summaryTable: { marginTop: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  footer: { marginTop: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  signatureBlock: { alignItems: "center", width: 180 },
  signatureImage: { width: 120, height: 40, objectFit: "contain", marginBottom: 4 },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#1e293b", width: 160, marginBottom: 4 },
  signatureLabel: { fontSize: 8, color: "#64748b" },
  disclaimer: { fontSize: 7, color: "#94a3b8", marginTop: 24, textAlign: "center" },
});

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {data.logoUrl && <Image src={data.logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.instituteName}>{data.instituteName}</Text>
              <Text style={styles.instituteEmail}>{data.instituteEmail}</Text>
            </View>
          </View>
          <View style={styles.receiptMeta}>
            <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
            <Text style={styles.receiptNumber}>{data.receiptNumber}</Text>
            <Text style={styles.receiptDate}>{data.paidAt}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Received From</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Student</Text>
            <Text style={styles.rowValue}>{data.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Course</Text>
            <Text style={styles.rowValue}>{data.courseName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Phone</Text>
            <Text style={styles.rowValue}>{data.studentPhone}</Text>
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount Paid ({METHOD_LABEL[data.method] ?? data.method})</Text>
          <Text style={styles.amountValue}>₹{data.amount.toLocaleString("en-IN")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Summary</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Total Fee</Text>
              <Text style={styles.rowValue}>₹{data.invoiceTotal.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Paid To Date</Text>
              <Text style={styles.rowValue}>₹{data.invoicePaidToDate.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.rowLabel}>Balance Pending</Text>
              <Text style={styles.rowValue}>₹{data.invoiceBalance.toLocaleString("en-IN")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 8, color: "#94a3b8" }}>Thank you for your payment.</Text>
          <View style={styles.signatureBlock}>
            {data.signatureUrl ? (
              <Image src={data.signatureUrl} style={styles.signatureImage} />
            ) : (
              <View style={{ height: 40 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{data.signatoryName || "Authorized Signatory"}</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This is a computer-generated receipt. Retain this for your records.
        </Text>
      </Page>
    </Document>
  );
}
