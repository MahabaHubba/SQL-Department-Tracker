INSERT INTO department (department_name)
VALUES ('Fashion'),
       ('Sports'),
       ('Glasses'),
       ('Clothing'),
       ('Food');

INSERT INTO role (role_title, role_salary, department_id) 
VALUES ('Fashion Designer', 120000.00, 1),
       ('Sports Trainer', 180000.00, 2),
       ('Optomotrist', 150000.00, 3),
       ('Retail Wirker', 80000.00, 4),
       ('Resturant', 160000.00, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('Mahaba', 'Hubba', 1, NULL),
       ('Micheal', 'Jordan', 2, NULL),
       ('Mitchell', 'Johnson', 4, NULL),
       ('Ray', 'Allen', 5, NULL),
       ('Anthony', 'Davis', 5, 4),
       ('Joshua', 'Brown', 4, 3),
       ('Ash', 'Ketchum', 3, NULL),
       ('Misty', 'Ceruleun', 3, 7),
       ('Brock', 'Pewter', 2, 2),
       ('Gary', 'Oak', 5, 3);