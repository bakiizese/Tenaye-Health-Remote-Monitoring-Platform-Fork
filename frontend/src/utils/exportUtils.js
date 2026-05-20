/**
 * Export Utilities
 * Frontend-only export functions using browser APIs
 * No backend required - works with data already loaded in the page
 *
 * BACKEND INTEGRATION:
 * When backend is ready, replace the mock data calls with real API calls
 * The export functions will automatically use the service layer
 */

import {
  exportUsers as serviceExportUsers,
  exportDoctors as serviceExportDoctors,
  exportAppointments as serviceExportAppointments,
  exportPayments as serviceExportPayments,
  exportBlogs as serviceExportBlogs,
  exportDashboardReport as serviceExportDashboardReport,
} from "../services/adminService";

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without .csv extension)
 * @param {Array} columns - Optional: specific columns to export
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export users/patients to CSV
 */
export const exportUsers = async () => {
  try {
    const data = await serviceExportUsers();
    const csvData = data.map((user) => ({
      Name: user.name,
      Email: user.email,
      Age: user.age,
      Gender: user.gender,
      Status: user.status,
      "Last Active": user.lastActive,
    }));

    exportToCSV(csvData, "patients");
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export users. Please try again.");
  }
};

/**
 * Export doctors to CSV
 */
export const exportDoctors = async () => {
  try {
    const data = await serviceExportDoctors();
    const csvData = data.map((doctor) => ({
      Name: doctor.name,
      Specialty: doctor.specialty,
      Experience: doctor.experience,
      Rating: doctor.rating,
      "Consultation Fee": doctor.fee,
      Status: doctor.status,
    }));

    exportToCSV(csvData, "doctors");
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export doctors. Please try again.");
  }
};

/**
 * Export appointments to CSV
 */
export const exportAppointments = async () => {
  try {
    const data = await serviceExportAppointments();
    const csvData = data.map((apt) => ({
      "Appointment ID": apt.id,
      Patient: apt.patient,
      Doctor: apt.doctor,
      Specialty: apt.specialty,
      Date: apt.date,
      Time: apt.time,
      Duration: apt.duration,
      Status: apt.status,
    }));

    exportToCSV(csvData, "appointments");
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export appointments. Please try again.");
  }
};

/**
 * Export payments to CSV
 */
export const exportPayments = async () => {
  try {
    const data = await serviceExportPayments();
    const csvData = data.map((payment) => ({
      "Transaction ID": payment.id,
      Patient: payment.patient,
      Doctor: payment.doctor,
      Amount: payment.amount,
      Gateway: payment.gateway,
      Date: payment.date,
      Status: payment.status,
    }));

    exportToCSV(csvData, "payments");
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export payments. Please try again.");
  }
};

/**
 * Export blogs to CSV
 */
export const exportBlogs = async () => {
  try {
    const data = await serviceExportBlogs();
    const csvData = data.map((blog) => ({
      Title: blog.title,
      Author: blog.author,
      Category: blog.category,
      Status: blog.status,
      "Published Date": blog.publishedDate,
      Views: blog.views || 0,
    }));

    exportToCSV(csvData, "blogs");
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export blogs. Please try again.");
  }
};

/**
 * Export dashboard report as text file
 * (For PDF, you'd need jspdf library)
 */
export const exportDashboardReport = async () => {
  try {
    const { stats, activity } = await serviceExportDashboardReport();

    const reportContent = `
Tenaye Health Admin Dashboard Report
Generated: ${new Date().toLocaleString()}
=====================================

PLATFORM STATISTICS
-------------------
Total Patients: ${stats.totalPatients.toLocaleString()}
Active Doctors: ${stats.activeDoctors.toLocaleString()}
Appointments Today: ${stats.appointmentsToday}
Total Revenue: ${stats.totalRevenue.toLocaleString()} ETB

RECENT ACTIVITY
---------------
${activity.map((item, i) => `${i + 1}. ${item.text} - ${item.time}`).join("\n")}

=====================================
End of Report
`;

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dashboard_report_${new Date().toISOString().split("T")[0]}.txt`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export dashboard report. Please try again.");
  }
};
