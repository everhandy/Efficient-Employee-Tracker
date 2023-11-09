const inquirer = require("inquirer");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
      host: 'localhost',
      user: process.env.DB_USER,        
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME, 
});

db.connect((err) => {
      if (err) {
          console.error('Error connecting to database: ' + err.message);
          return;
      }
      console.log('Connected to the database.');
      startApp();
});

function startApp() {
      inquirer
          .prompt({
              name: "action",
              type: "list",
              message: "What would you like to do?",
              choices: [
                  "View All Employees",
                  "Add Employee",
                  "Update Employee Role",
                  "View All Roles",
                  "Add Role",
                  "View All Departments",
                  "Add Department",
                  "Quit",
              ],
          })
          .then((answer) => {
              switch (answer.action) {
                  case "View All Employees":
                      viewAll("employee");
                      break;
  
                  case "Add Employee":
                      addEmployee();
                      break;
  
                  case "Update Employee Role":
                      updateEmployeeRole();
                      break;
  
                  case "View All Roles":
                        viewAll("role");
                      break;
  
                  case "Add Role":
                      addRole();
                      break;
  
                  case "View All Departments":
                      viewAll("department");
                      break;
  
                  case "Add Department":
                      addDepartment();
                      break;
  
                  case "Quit":
                      console.log("Exiting the application.");
                      db.end();
                      break;
              }
          });
};

function viewAll(choice) {
      db.query(`Select * FROM ${choice}`, (err, res) => {
            if (err) throw err;
            console.log(res);
            startApp();
      })
};
  
function addEmployee() {
      inquirer
      .prompt([
          {
              name: "first_name",
              type: "input",
              message: "Enter employee's first name:",
          },
          {
              name: "last_name",
              type: "input",
              message: "Enter employee's last name:",
          },
          {
              name: "role_id",
              type: "input",
              message: "Enter employee's role ID:",
          },
          {
              name: "manager_id",
              type: "input",
              message: "Enter employee's manager ID (or leave blank if none):",
              default: null, // Set default to null
              filter: (input) => (input === '' ? null : input),
          },
      ])
      .then((choice) => {
          db.query(
              "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
              [choice.first_name, choice.last_name, choice.role_id, choice.manager_id],
              (err, res) => {
                  if (err) throw err;
                  console.log("Employee added successfully!");
                  startApp();
              }
          );
      });
};
  
function updateEmployeeRole() {
      db.query("SELECT * FROM employee", (err, employee) => {
            if (err) throw err;
    
            const employeeChoices = employee.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));
    
            inquirer
                .prompt([
                    {
                        name: "employee_id",
                        type: "list",
                        message: "Select the employee to update:",
                        choices: employeeChoices,
                    },
                    {
                        name: "new_role_id",
                        type: "input",
                        message: "Enter the new role ID for the employee:",
                    },
                ])
                .then((choice) => {
                    db.query(
                        "UPDATE employee SET role_id = ? WHERE id = ?",
                        [choice.new_role_id, choice.employee_id],
                        (err, res) => {
                            if (err) throw err;
                            console.log("Employee role updated successfully!");
                            startApp();
                        }
                    );
                });
      });
};
  
function addRole() {
      db.query("SELECT * FROM department", (err, department) => {
          if (err) throw err;
  
          inquirer
              .prompt([
                  {
                      name: "title",
                      type: "input",
                      message: "Enter the title of the new role:",
                  },
                  {
                      name: "salary",
                      type: "input",
                      message: "Enter the salary for the new role:",
                  },
                  {
                      name: "department_id",
                      type: "list",
                      message: "Select the department for the new role:",
                      choices: department.map((department) => ({
                          name: department.name,
                          value: department.id,
                      })),
                  },
              ])
              .then((choice) => {
                  db.query(
                      "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                      [choice.title, choice.salary, choice.department_id],
                      (err, res) => {
                          if (err) throw err;
                          console.log("Role added successfully!");
                          startApp();
                      }
                  );
              });
      });
};
  
function addDepartment() {
      inquirer
          .prompt([
              {
                  name: "name",
                  type: "input",
                  message: "Enter the name of the new department:",
              },
          ])
          .then((choice) => {
              db.query(
                  "INSERT INTO department (name) VALUES (?)",
                  [choice.name],
                  (err, res) => {
                      if (err) throw err;
                      console.log("Department added successfully!");
                      startApp();
                  }
              );
          });
;}