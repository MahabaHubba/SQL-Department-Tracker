SELECT employee.first_name AS First_name,
       employee.last_name AS Last_name,
       role.role_title AS Role_Title,
       department.department_name AS Department,
       role.role_salary AS Salary, 
       CONCAT(manager.first_name, ' ', manager.last_name) AS Manager_Name
FROM employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN department ON role.department_id = department.id
LEFT JOIN employee AS manager ON employee.manager_id = manager.id
ORDER BY employee.id;

