import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const token = process.env.WHATSAPP_TOKEN || "";
const phone_number_id = process.env.WHATSAPP_PHONE_ID || "";
const SHEET_API = "https://api.sheetbest.com/sheets/29141f75-91aa-4f61-81b7-7a42dc755e94";

const managers = {
  "971501234567": "971509876543"
};

const userState = {};

const messages = {
  ar: {
    welcome: "مرحبًا بك! 👋\n\n*نظام الموارد البشرية*\n\nاختر الخدمة:\n\n1️⃣ طلب إجازة\n2️⃣ طلب سلفة\n3️⃣ خدمات الموارد البشرية",
    cancelled: "❌ تم إلغاء العملية.\n\nاختر:\n1️⃣ طلب إجازة\n2️⃣ طلب سلفة\n3️⃣ خدمات الموارد البشرية\n\n0️⃣ إلغاء",
    leave_request: "🏖️ *طلب إجازة*\n\nاختر نوع الإجازة:\n\n▫️ سنوية\n▫️ مرضية\n▫️ طارئة\n\n0️⃣ إلغاء",
    advance_request: "💰 *طلب سلفة*\n\nمن فضلك أرسل المبلغ المطلوب (بالدرهم)\n\nمثال: 5000\n\n0️⃣ إلغاء",
    hr_services: "📋 *خدمات الموارد البشرية*\n\nللاستفسارات والخدمات:\n✉️ hr@alzani.ae\n\n---\n\nاختر:\n1️⃣ طلب إجازة\n2️⃣ طلب سلفة\n3️⃣ خدمات الموارد البشرية",
    invalid_leave_type: "⚠️ نوع إجازة غير صحيح. اختر:\n\n▫️ سنوية\n▫️ مرضية\n▫️ طارئة\n\n0️⃣ إلغاء",
    leave_type_selected: (type) => `✅ نوع الإجازة: ${type}\n\nأدخل تاريخ البداية:\n\nمثال: 2025-10-25\n\n0️⃣ إلغاء`,
    invalid_date_format: "⚠️ صيغة التاريخ غير صحيحة.\n\nأدخل التاريخ بالصيغة:\nYYYY-MM-DD\n\nمثال: 2025-10-25\n\n0️⃣ إلغاء",
    start_date_set: (date) => `📅 تاريخ البداية: ${date}\n\nأدخل تاريخ النهاية:\n\nمثال: 2025-10-30\n\n0️⃣ إلغاء`,
    end_date_set: (date) => `📅 تاريخ النهاية: ${date}\n\nأدخل سبب الإجازة:\n\n0️⃣ إلغاء`,
    leave_success: (id, type, start, end, reason) => `✅ *تم إرسال طلب الإجازة بنجاح!*\n\nرقم الطلب: ${id}\nالنوع: ${type}\nمن: ${start}\nإلى: ${end}\nالسبب: ${reason}\n\nسيتم مراجعة طلبك قريباً.`,
    leave_notification: (id, emp, type, start, end, reason) => `🔔 *طلب إجازة جديد*\n\nرقم الطلب: ${id}\nرقم الموظف: ${emp}\nالنوع: ${type}\nمن: ${start}\nإلى: ${end}\nالسبب: ${reason}`,
    invalid_amount: "⚠️ المبلغ غير صحيح.\n\nأدخل مبلغ صحيح بالدرهم:\n\nمثال: 5000\n\n0️⃣ إلغاء",
    amount_set: (amount) => `💰 المبلغ: ${amount} درهم\n\nأدخل سبب السلفة:\n\n0️⃣ إلغاء`,
    advance_success: (id, amount, reason) => `✅ *تم إرسال طلب السلفة بنجاح!*\n\nرقم الطلب: ${id}\nالمبلغ: ${amount} درهم\nالسبب: ${reason}\n\nسيتم مراجعة طلبك قريباً.`,
    advance_notification: (id, emp, amount, reason) => `🔔 *طلب سلفة جديد*\n\nرقم الطلب: ${id}\nرقم الموظف: ${emp}\nالمبلغ: ${amount} درهم\nالسبب: ${reason}`,
    save_error: "❌ حدث خطأ في حفظ الطلب. يرجى المحاولة مرة أخرى.",
    annual: "سنوية",
    sick: "مرضية",
    emergency: "طارئة",
    leave_label: "إجازة",
    advance_label: "سلفة",
    pending_status: "قيد المراجعة",
    aed: "درهم"
  },
  en: {
    welcome: "Welcome! 👋\n\n*HR System*\n\nChoose a service:\n\n1️⃣ Leave Request\n2️⃣ Salary Advance\n3️⃣ HR Services\n\n0️⃣ Cancel",
    cancelled: "❌ Operation cancelled.\n\nChoose:\n1️⃣ Leave Request\n2️⃣ Salary Advance\n3️⃣ HR Services\n\n0️⃣ Cancel",
    leave_request: "🏖️ *Leave Request*\n\nChoose leave type:\n\n▫️ Annual\n▫️ Sick\n▫️ Emergency\n\n0️⃣ Cancel",
    advance_request: "💰 *Salary Advance Request*\n\nPlease send the requested amount (in AED)\n\nExample: 5000\n\n0️⃣ Cancel",
    hr_services: "📋 *HR Services*\n\nFor inquiries and services:\n✉️ hr@alzani.ae\n\n---\n\nChoose:\n1️⃣ Leave Request\n2️⃣ Salary Advance\n3️⃣ HR Services",
    invalid_leave_type: "⚠️ Invalid leave type. Choose:\n\n▫️ Annual\n▫️ Sick\n▫️ Emergency\n\n0️⃣ Cancel",
    leave_type_selected: (type) => `✅ Leave type: ${type}\n\nEnter start date:\n\nExample: 2025-10-25\n\n0️⃣ Cancel`,
    invalid_date_format: "⚠️ Invalid date format.\n\nEnter date in format:\nYYYY-MM-DD\n\nExample: 2025-10-25\n\n0️⃣ Cancel",
    start_date_set: (date) => `📅 Start date: ${date}\n\nEnter end date:\n\nExample: 2025-10-30\n\n0️⃣ Cancel`,
    end_date_set: (date) => `📅 End date: ${date}\n\nEnter leave reason:\n\n0️⃣ Cancel`,
    leave_success: (id, type, start, end, reason) => `✅ *Leave request submitted successfully!*\n\nRequest ID: ${id}\nType: ${type}\nFrom: ${start}\nTo: ${end}\nReason: ${reason}\n\nYour request will be reviewed soon.`,
    leave_notification: (id, emp, type, start, end, reason) => `🔔 *New Leave Request*\n\nRequest ID: ${id}\nEmployee: ${emp}\nType: ${type}\nFrom: ${start}\nTo: ${end}\nReason: ${reason}`,
    invalid_amount: "⚠️ Invalid amount.\n\nEnter a valid amount in AED:\n\nExample: 5000\n\n0️⃣ Cancel",
    amount_set: (amount) => `💰 Amount: ${amount} AED\n\nEnter reason for advance:\n\n0️⃣ Cancel`,
    advance_success: (id, amount, reason) => `✅ *Salary advance request submitted successfully!*\n\nRequest ID: ${id}\nAmount: ${amount} AED\nReason: ${reason}\n\nYour request will be reviewed soon.`,
    advance_notification: (id, emp, amount, reason) => `🔔 *New Salary Advance Request*\n\nRequest ID: ${id}\nEmployee: ${emp}\nAmount: ${amount} AED\nReason: ${reason}`,
    save_error: "❌ Error saving request. Please try again.",
    annual: "Annual",
    sick: "Sick",
    emergency: "Emergency",
    leave_label: "Leave",
    advance_label: "Salary Advance",
    pending_status: "Pending Review",
    aed: "AED"
  }
};

function detectLanguage(text) {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? 'ar' : 'en';
}

function normalizeArabicNumbers(text) {
  const arabicToEnglish = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return text.replace(/[٠-٩]/g, (digit) => arabicToEnglish[digit]);
}

function genRequestId() {
  return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

app.get("/webhook", (req, res) => {
  const verify_token = "12345";
  const mode = req.query["hub.mode"];
  const token_q = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token_q === verify_token) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  console.log("📨 Incoming:", JSON.stringify(req.body, null, 2));
  
  try {
    const messages_data = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages_data) return res.sendStatus(200);

    const message = messages_data[0];
    const from = message.from;
    const text = message.text?.body?.trim();
    
    if (!text) return res.sendStatus(200);

    await handleMessage(from, text);
  } catch (e) {
    console.error("❌ Error:", e);
  }
  
  res.sendStatus(200);
});

async function handleMessage(from, text) {
  let state = userState[from] || {};
  
  if (!state.lang) {
    state.lang = detectLanguage(text);
    userState[from] = state;
  }

  text = normalizeArabicNumbers(text);
  const lower = text.toLowerCase();
  const lang = state.lang;
  const msg = messages[lang];

  if (lower === "0" || lower.includes("cancel") || lower.includes("إلغاء") || lower.includes("الغاء")) {
    delete userState[from];
    await sendMessage(from, msg.cancelled);
    return;
  }

  if (state.type === "leave") {
    await handleLeaveFlow(from, text, state, lang);
  } else if (state.type === "advance") {
    await handleAdvanceFlow(from, text, state, lang);
  } else {
    await handleMainMenu(from, text, lang);
  }
}

async function handleMainMenu(from, text, lang) {
  const lower = text.toLowerCase();
  const msg = messages[lang];

  if (lower.includes("leave") || lower.includes("اجازة") || lower.includes("إجازة") || lower === "1") {
    userState[from] = { type: "leave", step: "type", lang };
    await sendMessage(from, msg.leave_request);
  } else if (lower.includes("advance") || lower.includes("salary") || lower.includes("سلفة") || lower === "2") {
    userState[from] = { type: "advance", step: "amount", lang };
    await sendMessage(from, msg.advance_request);
  } else if (lower.includes("services") || lower.includes("hr") || lower.includes("خدمات") || lower === "3") {
    await sendMessage(from, msg.hr_services);
  } else {
    await sendMessage(from, msg.welcome);
  }
}

async function handleLeaveFlow(from, text, state, lang) {
  const lower = text.toLowerCase();
  const msg = messages[lang];

  if (state.step === "type") {
    let leaveType = "";
    let leaveTypeLabel = "";
    
    if (lower.includes("annual") || lower.includes("سنوية") || lower.includes("سنويه")) {
      leaveType = msg.annual;
      leaveTypeLabel = "Annual";
    } else if (lower.includes("sick") || lower.includes("مرضية") || lower.includes("مرضيه")) {
      leaveType = msg.sick;
      leaveTypeLabel = "Sick";
    } else if (lower.includes("emergency") || lower.includes("طارئة") || lower.includes("طارئه") || lower.includes("طوارئ")) {
      leaveType = msg.emergency;
      leaveTypeLabel = "Emergency";
    } else {
      await sendMessage(from, msg.invalid_leave_type);
      return;
    }

    userState[from] = { type: "leave", step: "start_date", leaveType, leaveTypeLabel, lang };
    await sendMessage(from, msg.leave_type_selected(leaveType));

  } else if (state.step === "start_date") {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(text)) {
      await sendMessage(from, msg.invalid_date_format);
      return;
    }

    userState[from] = { ...state, step: "end_date", startDate: text };
    await sendMessage(from, msg.start_date_set(text));

  } else if (state.step === "end_date") {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(text)) {
      await sendMessage(from, msg.invalid_date_format);
      return;
    }

    userState[from] = { ...state, step: "reason", endDate: text };
    await sendMessage(from, msg.end_date_set(text));

  } else if (state.step === "reason") {
    const requestId = genRequestId();
    const leaveData = {
      request_id: requestId,
      employee_number: from,
      request_type: messages.en.leave_label,
      leave_type: state.leaveTypeLabel,
      start_date: state.startDate,
      end_date: state.endDate,
      reason: text,
      status: messages.en.pending_status,
      timestamp: new Date().toISOString(),
      language: lang
    };

    const success = await saveToSheet(leaveData);

    if (success) {
      await sendMessage(from, msg.leave_success(requestId, state.leaveType, state.startDate, state.endDate, text));

      const managerNumber = managers[from];
      if (managerNumber) {
        await sendMessage(managerNumber, msg.leave_notification(requestId, from, state.leaveType, state.startDate, state.endDate, text));
      }
    } else {
      await sendMessage(from, msg.save_error);
    }

    delete userState[from];
  }
}

async function handleAdvanceFlow(from, text, state, lang) {
  const msg = messages[lang];

  if (state.step === "amount") {
    const amount = parseFloat(text.replace(/[,٬]/g, ""));
    
    if (isNaN(amount) || amount <= 0) {
      await sendMessage(from, msg.invalid_amount);
      return;
    }

    userState[from] = { ...state, step: "reason", amount };
    await sendMessage(from, msg.amount_set(amount));

  } else if (state.step === "reason") {
    const requestId = genRequestId();
    const advanceData = {
      request_id: requestId,
      employee_number: from,
      request_type: messages.en.advance_label,
      amount: state.amount,
      reason: text,
      status: messages.en.pending_status,
      timestamp: new Date().toISOString(),
      language: lang
    };

    const success = await saveToSheet(advanceData);

    if (success) {
      await sendMessage(from, msg.advance_success(requestId, state.amount, text));

      const managerNumber = managers[from];
      if (managerNumber) {
        await sendMessage(managerNumber, msg.advance_notification(requestId, from, state.amount, text));
      }
    } else {
      await sendMessage(from, msg.save_error);
    }

    delete userState[from];
  }
}

async function saveToSheet(data) {
  try {
    const response = await fetch(SHEET_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error("❌ SheetBest error:", response.status, await response.text());
      return false;
    }

    console.log("✅ Data saved to sheet:", data.request_id);
    return true;
  } catch (e) {
    console.error("❌ Sheet save error:", e);
    return false;
  }
}

async function sendMessage(to, text) {
  if (!token || !phone_number_id) {
    console.log("⚠️ WhatsApp credentials not set. Message:", text);
    return;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phone_number_id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body: text }
      })
    });

    if (!response.ok) {
      console.error("❌ WhatsApp API error:", response.status, await response.text());
    } else {
      console.log("✅ Message sent to:", to);
    }
  } catch (e) {
    console.error("❌ Send error:", e);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 WhatsApp HR Bot running on port ${PORT}`);
  console.log(`📋 SheetBest API: ${SHEET_API}`);
  console.log(`⚙️ WhatsApp configured: ${!!token && !!phone_number_id}`);
  console.log(`🌐 Languages: Arabic & English`);
});
