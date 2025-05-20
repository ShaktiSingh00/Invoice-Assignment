const InvoiceController = {
  submitInvoice: function (model, view) {
    const name = view.$("#customer-name").val().trim();
    const date = view.$("#invoice-date").val().trim();

    if (!name || !date) {
      alert("Please fill in all fields.");
      return;
    }

    model.set({ customer_name: name, invoice_date: date });

    model.save(null, {
      success: (model, response) => {
        const invoiceRecordId = response.history?.[0]?.recordid;
        if (!invoiceRecordId) return alert("Invoice ID missing.");

        view.$(".invoice-item-row").each(function () {
          const $row = $(this);
          const productData = $row.find(".product-select").select2("data")[0];
          const qty = parseFloat($row.find(".quantity").val()) || 0;
          const price = parseFloat($row.find(".unit-price").val()) || 0;

          if (!productData || !qty || !price) return;

          const payload = {
            dataform_id: "pg7khpfrx7",
            fields: {
              item: productData.text,
              quantity: qty,
              unit_price: price,
            },
            dbvalues: {
              invoice: String(invoiceRecordId),
              item: productData.id,
            },
            action_type: ""
          };

          $.ajax({
            url: "https://shakti.orgzit.com/api/1/ozrecord/",
            method: "POST",
            headers: {
              Authorization: CONFIG.API_KEY,
              "Content-Type": "application/json",
            },
            data: JSON.stringify(payload),
          });
        });

        alert("Invoice submitted successfully!");
      },
      error: () => {
        alert("Error saving invoice.");
      }
    });
  }
};
