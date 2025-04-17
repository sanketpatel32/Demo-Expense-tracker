const baseurl = "http://13.233.159.232";
const token = localStorage.getItem("token");

if (!token) {
  alert("You are not logged in! Please log in to continue.");
  window.location.href = "user/login";
}

let EXPENSES_PER_PAGE = parseInt(localStorage.getItem("expensesPerPage")) || 5;
let currentPage = 1;
let allExpenses = [];

const fetchExpenses = () => {
  axios.get(`${baseurl}/expense/getAll`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      allExpenses = response.data.expenses;
      renderExpenses(allExpenses);
    })
    .catch((error) => {
      console.error("Error fetching expenses:", error);
      alert("Failed to fetch expenses. Please try again.");
    });
};

const handleExpensesPerPageChange = () => {
  const selectedValue = parseInt(document.getElementById("expensesPerPage").value);
  EXPENSES_PER_PAGE = selectedValue;
  localStorage.setItem("expensesPerPage", selectedValue);
  currentPage = 1;
  renderExpenses(allExpenses);
};

const renderExpenses = (expenses) => {
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = `
    <table id="expense-table" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <thead style="background-color: #f0f0f0;">
        <tr>
          <th style="padding: 4px;">Amount</th>
          <th style="padding: 4px;">Description</th>
          <th style="padding: 4px;">Category</th>
          <th style="padding: 4px;">Action</th>
        </tr>
      </thead>
      <tbody id="expense-table-body"></tbody>
    </table>
    <div id="pagination" style="margin-top: 10px;"></div>
  `;

  const tableBody = document.getElementById("expense-table-body");

  const start = (currentPage - 1) * EXPENSES_PER_PAGE;
  const end = start + EXPENSES_PER_PAGE;
  const pageExpenses = expenses.slice(start, end);

  pageExpenses.forEach((expense) => {
    const row = document.createElement("tr");

    const amountCell = document.createElement("td");
    amountCell.textContent = expense.amount;
    amountCell.style.padding = "4px";

    const descCell = document.createElement("td");
    descCell.textContent = expense.description;
    descCell.style.padding = "4px";

    const categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category;
    categoryCell.style.padding = "4px";

    const actionCell = document.createElement("td");
    actionCell.style.padding = "4px";
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.backgroundColor = "#ff4d4d";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "4px 8px";
    deleteButton.style.cursor = "pointer";
    deleteButton.onclick = () => deleteExpense(expense.id);
    actionCell.appendChild(deleteButton);

    row.appendChild(amountCell);
    row.appendChild(descCell);
    row.appendChild(categoryCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });

  renderPagination(expenses.length);
};

const renderPagination = (totalItems) => {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalItems / EXPENSES_PER_PAGE);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.margin = "0 5px";
    btn.style.padding = "4px 8px";
    btn.style.border = i === currentPage ? "2px solid black" : "1px solid gray";
    btn.style.backgroundColor = i === currentPage ? "#dcdcdc" : "white";

    btn.onclick = () => {
      currentPage = i;
      renderExpenses(allExpenses);
    };

    pagination.appendChild(btn);
  }
};

const handleAddExpense = (event) => {
  event.preventDefault();
  const amount = document.getElementById("amount").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  if (!amount || !description || !category) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  const expense = { amount, description, category };

  axios.post(`${baseurl}/expense/add`, expense, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => {
      document.getElementById("amount").value = "";
      document.getElementById("description").value = "";
      document.getElementById("category").value = "food";
      fetchExpenses();
    })
    .catch((error) => {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    });
};

const deleteExpense = (expenseId) => {
  axios.delete(`${baseurl}/expense/delete/${expenseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => {
      fetchExpenses();
    })
    .catch((error) => {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    });
};

const checkPremiumUser = () => {
  axios.get(`${baseurl}/user/isPremium`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((response) => {
      const isPremium = response.data.isPremium;
      if (isPremium) {
        const renderBtn = document.getElementById("renderBtn");
        if (renderBtn) renderBtn.style.display = "none";

        const premiumMessage = document.getElementById("premiumuser");
        if (premiumMessage) {
          premiumMessage.textContent = "🌟 You are a premium user! Enjoy unlimited access to all features.";
          premiumMessage.style.color = "green";
        }

        const container = document.getElementById("premiumuser_container");
        if (container) {
          const showLeaderBoard = document.createElement("button");
          showLeaderBoard.type = "button";
          showLeaderBoard.textContent = "Show Leaderboard";
          showLeaderBoard.style.marginTop = "15px";
          showLeaderBoard.style.padding = "8px 16px";
          showLeaderBoard.style.backgroundColor = "#4CAF50";
          showLeaderBoard.style.color = "white";
          showLeaderBoard.style.border = "none";
          showLeaderBoard.style.cursor = "pointer";

          showLeaderBoard.onclick = () => {
            axios.get(`${baseurl}/expense/leaderboard`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then((res) => {
                const leaderboardData = res.data;
                const leaderboardContainer = document.getElementById("leaderboard_container");
                leaderboardContainer.innerHTML = "<h2>Leaderboard</h2>";

                const table = document.createElement("table");
                table.style.borderCollapse = "collapse";
                table.style.width = "100%";
                table.style.marginTop = "10px";
                table.style.fontFamily = "sans-serif";

                const headerRow = document.createElement("tr");
                headerRow.innerHTML = `
              <th style="background-color:#f0f0f0; padding:5px; border:1px solid #ddd;">Name</th>
              <th style="background-color:#f0f0f0; padding:5px; border:1px solid #ddd;">Total Expense</th>`;
                table.appendChild(headerRow);

                leaderboardData.forEach(user => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
                <td style="padding:5px; border:1px solid #ddd;">${user.name}</td>
                <td style="padding:5px; border:1px solid #ddd;">${user.totalExpense}</td>`;
                  table.appendChild(row);
                });

                leaderboardContainer.appendChild(table);
                leaderboardContainer.style.display = "block";
              })
              .catch((error) => {
                console.error("Error fetching leaderboard data:", error);
                alert("Failed to fetch leaderboard data.");
              });
          };

          container.appendChild(showLeaderBoard);

          const downloadBtn = document.createElement("button");
          downloadBtn.type = "button";
          downloadBtn.textContent = "Download Expenses";
          downloadBtn.style.marginLeft = "10px";
          downloadBtn.style.padding = "8px 16px";
          downloadBtn.style.backgroundColor = "#730316";
          downloadBtn.style.color = "white";
          downloadBtn.style.border = "none";
          downloadBtn.style.cursor = "pointer";
          downloadBtn.onclick = () => {
            axios.get(`${baseurl}/expense/download`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then((response) => {
                // Create a temporary anchor element to trigger the download
                const a = document.createElement('a');
                a.href = response.data.fileURL; 
                a.setAttribute('download', 'expenses.txt'); // ✅ Forces download
                a.setAttribute('target', '_blank');    
                document.body.appendChild(a); 
                a.click();
              })
              .catch((error) => {
                console.error("Error downloading expenses:", error);
                alert("Failed to download expenses.");
              });
          }
          container.appendChild(downloadBtn);
        }
      }
    })
    .catch((error) => {
      console.error("Error checking premium user status:", error);
      alert("Failed to check user status.");
    });
};

window.onload = () => {
  const savedValue = localStorage.getItem("expensesPerPage");
  if (savedValue) {
    document.getElementById("expensesPerPage").value = savedValue;
  }

  fetchExpenses();
  checkPremiumUser();
};

