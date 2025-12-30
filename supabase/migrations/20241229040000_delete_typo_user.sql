-- Delete the user with the typo in email
DELETE FROM auth.users WHERE email LIKE '%hotmial.com%';
