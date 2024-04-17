//Installations of modules
const mysql = require('mysql2/promise'); //lionk with mysql library
const inquirer = require('inquirer'); // for prompt to be made in console log
require('dotenv').config(); // load env files

//Make connection to database

async function createConnection() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'department_db',
    })
};


// Create the console log display
function displayIntroduction() {
    console.log('--------------------------------------------------------');
    console.log('        DepartMent Store Tracker System         ');
    console.log('--------------------------------------------------------');
};

// Create main Menu options
async function startOptions() {
    const connection = await createConnection();
    try{
        while (true) {
            displayIntroduction();
            const answers = await inquirer.prompt([
                {
                    type: 'list', 
                    name: 'action',
                    message: 'What would you like to do today?',
                    choices: [
                        'View all departments',
                        'View all roles', 
                        'View all employees',
                        'Add a department',
                        'Add a role', 
                        'Add an employee',
                        'Update an employee role',
                        'Update employee manager',
                        'View employees by manager',
                        'View employees by department',
                        'Delete department',
                        'Delete role',
                        'Delete employee',
                        'View total utilized budget of a department',
                        'Exit'

                    ]
                }
            ]);


            switch (answers.action) {
                case 'View all departments':
                    await viewDepartments(connection);
                    break;
                 case 'View all roles':
                    await viewRoles(connection);
                    break;
                case 'View all emplopyees':
                    await viewEmployees(connection);
                    break;
                case 'Add a department':
                    await addDepartment(connection);
                    break;
                case 'Add a role':
                    await addRole(connection);
                    break;
                case 'Add an employee':
                    await addEmployee(connection);
                    break;
                case 'Update an employee role':
                    await updateEmployeeRole(connection);
                    break;
                case 'Update employee manager':
                    await updateEmployeeManager(connection);
                    break;
                case 'View employees by manager':
                    await viewEmployeesByManager(connection);
                    break;
                case 'View employees by department':
                    await viewEmployeesByDepartment(connection);
                    break;
                case 'Delete department':
                    await deleteDepartment(connection);
                    break;
                case 'Delete role':
                    await deleteRole(connection);
                    break;
                case 'Delete employee':
                    await deleteEmployee(connection);
                    break;
                case 'View total utilized budget of a department':
                    await viewDepartmentBudget(connection);
                    break;
                case 'Exit':
                    console.log('Thank you very much');
                    return;
                default:
                    console.log('Invalid choice');
            }
        }
    } catch(error) {
        console.error('Error in answers selected', error)
    } finally {
        connection.end();
    }
}

async function viewDepartments(connection) {
    const [rows] = await connection.query('SELECT * FROM department');
    console.table(rows);
}


// Function to view all roles
async function viewRoles(connection) {
    
    const [rows] = await connection.query(`
        SELECT role.id, role.role_title, role.role_salary, department.department_name 
        FROM role 
        INNER JOIN department ON role.department_id = department.id`);
    console.table(rows);
};

// Function to view employees
async function viewEmployees(connection) {
    const [rows] = await connection.query(`
    SELECT
        employee.id, employee.first_name, employee.last_name, 
        role.role_title AS role_title, department.department_name, role.role_salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `);
    console.table(rows);
};

//Function to add Departments
async function addDepartment(connection) {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the department:'
        }
    ]);
    await connection.execute('INSERT INTO department (department_name) VALUES (?)', [answer.departmentName]);
    console.log('Department added successfully!')
};

//Function to add role
async function addRole(connection) {
    const [departments] = await connection.query('SELECT id, department_name FROM department');

    const departmentChoices = departments.map(department => ({
        name: department.department_name, 
        value: department.id
    }));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:'
        },
        {
            type: 'input', 
            name: 'salary',
            message:'Enter the salary for the role:'
        }, 
        {
            type: 'list', 
            name: 'departmentId', 
            message: 'Select the department for the role:',
            choices: departmentChoices
        }
    ]);
     await connection.execute('INSERT INTO role (role_title, role_salary, department_id) VALUES (?, ?, ?)', [answers.title, answers.salary, answers.departmentId]);
};

//Add employee
async function addEmployee(connection) {
    //Retrieve data for role and manager
    const [roles] = await connection.query('SELECT id, role_title FROM role');
    const [managers] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee');
    
    //using map function to format data suitable for inquirer choice
    const roleChoices = roles.map(role => ({
        name: role.role_title, 
        value: role.id
    }));

    const managerChoices = managers.map(manager => ({
        name: manager.full_name,
        value: manager.id
    }));

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the first name of the employee:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the last name of the employee:'
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the role for the employee:',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the manager for the employee (if applicable):',
            choices: [
                { name: 'None', value: null }, // to give option of having noone
                ...managerChoices
            ]
        }
    ]);
    if(answers.managerId === null) {
        answers.managerId = null;
    }

    await connection.execute('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [answers.firstName, answers.lastName, answers.roleId, answers.managerId]);
    console.log('Able to add employees')
}

// Update Employee's role
async function updateEmployeeRole(connection) {
    //retrieve employee data and role data
    const [employees] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee');
    const [roles] = await connection.query('SELECT id, role_title FROM role');

    //Use map function to change based on inquirer choices
    const employeeChoices = employees.map(employee => ({
        name: employee.full_name, 
        value: employee.id
    }));

    const roleChoices = roles.map(role => ({
        name: role.role_title, 
        value: role.id
    }));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee whose role you want to update:',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role for the employee:',
            choices: roleChoices
        }
    ]);

    await connection.execute('UPDATE employee SET role_id = ? WHERE id = ?', [answers.roleId, answers.employeeId]);
    console.log('Succesfully updated employee role')
};

//Update employee Manager Role
async function updateEmployeeManager(connection) {
    //Rettrieve database for employtee manager
    const [employees] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee');
    //Use map function to update using inquirer choicves
    const employeeChoices = employees.map(employee => ({
        name: employee.full_name,
        value: employee.id
    }));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee whose manager you want to update:',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the new manager for the employee:',
            choices: employeeChoices
        }
    ]);
    await connection.execute('UPDATE employee SET manager_id = ? WHERE id= ?', [answers.managerId], [answers.employeeId]);
    console.log('Succesfully updated Employee Mnaager');
};

//Function top view Managers
async function viewEmployeesByManager(connection) {
    const [managers] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee WHERE manager_id IS NULL');

    const managerChoices = managers.map(manager => ({
        name: manager.full_name, 
        value: manager.id
    }));

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Select a manager to view their employees:',
            choices: managerChoices
        }
    ]);

    const [rows] = await connection.query(`
    SELECT id, CONCAT(first_name, " ", last_name) AS full_name
    FROM employee
    WHERE manager_id = ?
    `, [answer.managerId])
};

//Functino to view all departments employee
async function viewEmployeesByDepartment(connection) {
    //Retrive department data
    const [departments] = await connection.query('SELECT id, department_name FROM department');

    //utillise map function alongside inquirer choice
    const departmentChoices = departments.map(department => ({
        name: department.department_name,
        value: department.id
    }));

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Select a department to view its employees:',
        choices: departmentChoices
    });
    const [rows] = await connection.query(`
    SELECT e.id, CONCAT(e.first_name, " ", e.last_name) AS full_name 
    FROM employee e
    INNER JOIN role r ON e.role_id = r.id
    WHERE r.department_id = ?
`, [answer.departmentId]);
    console.table(rows);
};

//Delete department
async function deleteDepartment(connection) {
    // retrieve data of deparmtnet
    const [departments] = await connection.query('SELECT id, department_name from department');

    //utilise map function 
    const departmentChoices = departments.map(department => ({
        name: department.department_name,
        value: department.id
    }));

    const answer = await inquirer.prompt(
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select a department to delete:',
            choices: departmentChoices
        }
    )
        await connection.execute('DELETE FROM department WHERE id = ?', [answer.departmentId]);
        console.log('Succesfully deleted department')
};

//delete Role
async function deleteRole(connection) {
    const [roles] = await connection.query('SELECT id, role_title FROM role');
    
    const roleChoices = roles.map(role => ({
        name: role.role_title,
        value: role.id
    }));

    const answer = await inquirer.prompt(
        {
            type: 'list',
            name: 'roleId',
            message: 'Select a role to delete:',
            choices: roleChoices
        }
    );

    await connection.execute('DELETE FROM role WHERE id = ?', [answer.roleId]);

    console.log('Succesfully deleted role')
};

// delete employee
async function deleteEmployee(connection) {
    const [employees] = await connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee');

    const employeeChoices = employees.map(employee => (
        {
            name:  employee.full_name, 
            value: employee.id
        }
    ));

    const answer = await inquirer.prompt(
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select an employee to delete:',
            choices: employeeChoices
        }
    );

    await connection.execute('DELETE FROM emloyee WHERE id = ?', [answer.employeeId]);
    console.log('Successfully delted employee')
};

//View department budget
async function viewDepartmentBudget(connection) {
    const [departments] = await connection.query('SELECT id, department_name FROM department');

    const departmentChoices = departments.map(department => ({
        name: department.department_name,
        value: department.id
    }));

    const answer = await inquirer.prompt({
        type: 'list',
        name: 'departmentId',
        message: 'Select a department to view its total utilized budget:',
        choices: departmentChoices
    });

    const [results] = await connection.query('SELECT SUM(r.role_salary) AS total_budget FROM employee e JOIN role r ON e.role_id = r.id WHERE r.department_id = ?', [answer.departmentId]);
    console.log(`Total Utilized Budget of ${departmentChoices.find(dep => dep.value === answer.departmentId).name}: $${results[0].total_budget}`);
};

startOptions();