const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

function setNavOpen(open, focusToggle = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("nav-open", open);
  const label = toggle.querySelector(".nav-toggle-label");
  if (label) label.textContent = open ? "Close" : "Menu";
  if (!open && focusToggle) toggle.focus();
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setNavOpen(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (nav.contains(target) || toggle.contains(target)) return;
    setNavOpen(false);
  });
}

const form = document.querySelector("#estimate-form");

if (form) {
  form.dataset.ready = "true";

  const success = document.querySelector("#form-success");
  const status = document.querySelector("#form-status");
  const alertBox = document.querySelector("#form-alert");
  const summaryList = document.querySelector("#summary-list");
  const copyButton = document.querySelector("#copy-summary");
  const resetButton = document.querySelector("#reset-form");
  const copyFallback = document.querySelector("#summary-fallback");
  let summaryText = "";
  let prefilledTown = "";

  const params = new URLSearchParams(window.location.search);
  const townParam = params.get("town");
  if (townParam) {
    prefilledTown = townParam.replace(/[\u0000-\u001F]+/g, " ").trim().slice(0, 80);
    if (prefilledTown && form.elements.town && !form.elements.town.value) {
      form.elements.town.value = prefilledTown;
    }
  }

  const validators = {
    name(value) {
      return value.trim().length >= 2 ? "" : "Enter your name.";
    },
    town(value) {
      return value.trim().length >= 2 ? "" : "Enter the town where the project would be.";
    },
    email(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ""
        : "Enter an email address, like you@email.com.";
    },
    phone(value) {
      const trimmed = value.trim();
      if (!trimmed) return "";
      const digits = trimmed.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15
        ? ""
        : "Enter a phone number with an area code, or leave this blank.";
    },
    project(value) {
      return value ? "" : "Select a project type.";
    },
    details(value) {
      return value.trim().length >= 12
        ? ""
        : "Add a few details — a sentence about the yard is enough.";
    },
  };

  function errorNode(input) {
    const id = input.getAttribute("aria-errormessage");
    return id ? document.getElementById(id) : null;
  }

  function setFieldError(input, message) {
    const node = errorNode(input);
    if (node) node.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function clearErrors() {
    alertBox.hidden = true;
    alertBox.textContent = "";
    form.querySelectorAll("input, select, textarea").forEach((input) => {
      setFieldError(input, "");
    });
  }

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") setFieldError(input, "");
    });
  });

  function projectLabel() {
    const select = form.elements.project;
    const option = select.options[select.selectedIndex];
    return option ? option.text : "";
  }

  function buildSummary() {
    const name = form.elements.name.value.trim();
    const town = form.elements.town.value.trim();
    const email = form.elements.email.value.trim();
    const phone = form.elements.phone.value.trim();
    const project = projectLabel();
    const details = form.elements.details.value.trim();
    const when = new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());

    const rows = [
      ["Name", name],
      ["Town", town],
      ["Email", email],
      ["Phone", phone || "Not provided"],
      ["Project", project],
      ["Notes", details],
    ];

    summaryList.replaceChildren();
    rows.forEach(([label, value]) => {
      const group = document.createElement("div");
      const term = document.createElement("dt");
      term.textContent = label;
      const definition = document.createElement("dd");
      definition.textContent = value;
      group.append(term, definition);
      summaryList.append(group);
    });

    summaryText = [
      "Patio Pro's estimate request",
      "Status: Not sent. Completed in this browser only.",
      `Completed: ${when}`,
      "",
      `Name: ${name}`,
      `Town: ${town}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Project: ${project}`,
      "Notes:",
      details,
      "",
      "This summary was not emailed. Call 201-625-3062 or send it to info@patiopro.com. Patio Pro's is in Mahwah, NJ. NJ HIC #13VH12900000.",
    ].join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;

    form.querySelectorAll("input, select, textarea").forEach((input) => {
      const validate = validators[input.name];
      if (!validate) return;
      const message = validate(input.value);
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      alertBox.hidden = false;
      alertBox.textContent = "Check the highlighted fields. Nothing has been sent.";
      firstInvalid.focus();
      return;
    }

    clearErrors();
    buildSummary();
    form.hidden = true;
    success.hidden = false;
    if (status) status.textContent = "Form completed. This request was not sent.";
    const heading = document.getElementById("success-title");
    if (heading) heading.focus();
  });

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      copyButton.textContent = "Copied";
      if (status) status.textContent = "Summary copied. The request was still not sent.";
    } catch {
      copyFallback.hidden = false;
      copyFallback.value = summaryText;
      copyFallback.focus();
      copyFallback.select();
      copyButton.textContent = "Copy from the box below";
      if (status) status.textContent = "Clipboard was blocked. The summary box is selected so you can copy it.";
    }
    window.setTimeout(() => {
      copyButton.textContent = "Copy summary";
    }, 2200);
  });

  resetButton?.addEventListener("click", () => {
    form.reset();
    if (prefilledTown) form.elements.town.value = prefilledTown;
    clearErrors();
    copyFallback.hidden = true;
    copyFallback.value = "";
    summaryText = "";
    success.hidden = true;
    form.hidden = false;
    if (status) status.textContent = "";
    form.elements.name.focus();
  });
}
