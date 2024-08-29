const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const multer = require('multer');

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the directory for storing uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Generate unique filenames
    }
});

const upload = multer({ storage: storage });

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itg'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Endpoint to handle CONSTITUENCY form submission
app.post('/submit-constituency-form', (req, res) => {
    const { name, region } = req.body;

    if (!name || !region) {
        return res.status(400).send('Name and region are required');
    }

    const checkDuplicateQuery = 'SELECT * FROM constituency WHERE name = ? AND region = ?';
    db.query(checkDuplicateQuery, [name, region], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(409).send('Duplicate entry: The same name and region already exist');
        }

        const insertQuery = 'INSERT INTO constituency (name, region) VALUES (?, ?)';
        db.query(insertQuery, [name, region], (err, results) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('Constituency data inserted successfully');
        });
    });
});

// Endpoint to handle TALUKA form submission
app.post('/submit-taluka-form', (req, res) => {
    const { taluka, district } = req.body;

    if (!taluka || !district) {
        return res.status(400).send('Taluka and district are required');
    }

    const checkDuplicateQuery = 'SELECT * FROM taluka WHERE taluka = ? AND district = ?';
    db.query(checkDuplicateQuery, [taluka, district], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(409).send('Duplicate entry: The same taluka and district already exist');
        }

        const insertQuery = 'INSERT INTO taluka (taluka, district) VALUES (?, ?)';
        db.query(insertQuery, [taluka, district], (err, results) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('Taluka data inserted successfully');
        });
    });
});

// Route to handle VILLAGE submission
app.post('/submit-village-form', (req, res) => {
    const { village_name, constituency, taluka, district } = req.body;

    if (!village_name || !constituency || !taluka || !district) {
        return res.status(400).send('Village, constituency, taluka, and district are required');
    }

    // Check for duplicate entry
    const checkDuplicateQuery = 'SELECT * FROM village WHERE village_name = ? AND constituency = ? AND taluka = ? AND district = ?';
    db.query(checkDuplicateQuery, [village_name, constituency, taluka, district], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(409).send('Duplicate entry: The same village already exists');
        }

        // Insert data if no duplicate is found
        const insertQuery = 'INSERT INTO village (village_name, constituency, taluka, district) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [village_name, constituency, taluka, district], (err, results) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('Village data inserted successfully');
        });
    });
});
// Route to get village data
app.get('/get-village-form', (req, res) => {
    const query = 'SELECT village_name FROM village'; // Adjust as needed

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if results are in the expected format
        if (!Array.isArray(results)) {
            return res.status(500).json({ error: 'Invalid data format' });
        }

        // Send results as JSON
        res.json(results);
    });
});

// Corrected SUBMIT APEX FORM endpoint
app.post('/submit-apex-form', (req, res) => {
    const { amount, correspondance, release_date, apex_share_release } = req.body;

    if (!amount || !correspondance || !release_date || !apex_share_release) {
        return res.status(400).send('Amount, correspondance, release date, and apex release are required');
    }

    // Check for duplicate entry
    const checkDuplicateQuery = 'SELECT * FROM apex_share WHERE amount = ? AND correspondance = ? AND release_date = ? AND apex_share_release = ?';
    db.query(checkDuplicateQuery, [amount, correspondance, release_date, apex_share_release], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(409).send('Duplicate entry: The same entry already exists');
        }

        // Insert data if no duplicate is found
        const insertQuery = 'INSERT INTO apex_share (amount, correspondance, release_date, apex_share_release) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [amount, correspondance, release_date, apex_share_release], (err, results) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('Apex share data inserted successfully');
        });
    });
});

// Endpoint to get apex share data for dropdown
app.get('/get-apex-shares', (req, res) => {
    const query = 'SELECT apex_share_release FROM apex_share'; // Adjust query to select apex_share_release
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});
// Route to fetch all talukas
app.get('/talukas', (req, res) => {
    const sql = 'SELECT * FROM taluka';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching talukas:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json(results);
    });
});

// Endpoint to insert data into SCHEME table
app.post('/submit-schemeform', (req, res) => {
    try {
        const {
            scheme_number, scheme_name, loantype, category, apexbody,
            abbreviation, fileno, active, sector, schemeDetails
        } = req.body;

        if (!scheme_number || !scheme_name || !loantype || !category) {
            return res.status(400).json({ error: 'All required fields must be filled.' });
        }

        // Debugging: Log the received data
        console.log('Received data:', req.body);
        console.log('scheme_number:', scheme_number);
        console.log('scheme_name:', scheme_name);
        console.log('loantype:', loantype);
        console.log('category:', category);
 

        const query = `INSERT INTO schemes (
            scheme_number, scheme_name, loantype, category, apexbody,
            abbreviation, fileno, active, sector, from_amount, to_amount,
            min_duration, max_duration, repayment_period, gender, interest_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Flatten the schemeDetails array if you only have one set of details
        const schemeDetail = schemeDetails && schemeDetails[0] ? schemeDetails[0] : {};

        db.query(query, [
            scheme_number, scheme_name, loantype, category, apexbody, abbreviation,
            fileno, active, sector, schemeDetail.from_amount, schemeDetail.to_amount,
            schemeDetail.min_duration, schemeDetail.max_duration,
            schemeDetail.repayment_period, schemeDetail.gender, schemeDetail.interest_rate
        ], (err, results) => {
            if (err) {
                console.error('Error inserting scheme data:', err.message);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            res.json({ message: 'Data has been saved successfully!' });
        });
    } catch (error) {
        console.error('Error processing data:', error.message);
        res.status(500).json({ message: 'An error occurred while saving the data.' });
    }
});
//fetching schemes
app.get('/api/getSchemes', (req, res) => {
    const category = req.query.category;
    const loantype = req.query.loantype;
    if (!category || !loantype) {
        return res.status(400).send('Category and loantype is required');
    }

    const query = 'SELECT scheme_name FROM schemes WHERE category = ? AND loantype = ?';
    db.query(query, [category, loantype], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route for registering a new user
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            return res.status(409).send('User already exists');
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Internal Server Error');
            }

            const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(insertQuery, [email, hash], (err, _) => {
                if (err) {
                    console.error('Error inserting user into database:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.status(201).send('User registered successfully');
            });
        });
    });
});

// Route for logging in
app.post('/loginForm', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            console.log('No user found with this email');
            return res.status(401).send('Invalid email or password');
        }

        const user = results[0];
        console.log('User found:', user);  // Debugging line

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Error comparing passwords');
            }

            if (isMatch) {
                console.log('Password matched');  // Debugging line
                return res.send('Login successful');
            } else {
                console.log('Password did not match');  // Debugging line
                return res.status(401).send('Invalid email or password');
            }
        });
    });
});

// POST route to handle form submission
app.post('/api/submitForm', upload.array('documents'), async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Insert main application data
      const [result] = await connection.query('INSERT INTO house_repair_loan_applications SET ?', req.body);
      const applicationId = result.insertId;
  
      // Insert surety details
      if (req.body.surety_name) {
        await connection.query('INSERT INTO surety_details SET ?', {
          application_id: applicationId,
          salutation: req.body.surety_salutation,
          surety_name: req.body.surety_name,
          gender: req.body.surety_gender,
          father_husband_name: req.body.surety_father_name,
          company_name: req.body.surety_company_name,
          designation: req.body.surety_designation,
          salary_per_month: req.body.surety_salary_permonth,
          mobile_no: req.body.surety_mobile_no,
          address: req.body.surety_address
        });
      }
  
      // Insert submitted documents
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          await connection.query('INSERT INTO submitted_documents SET ?', {
            application_id: applicationId,
            document_name: file.originalname,
            submitted: true,
            description: req.body[`description_${file.fieldname}`],
            file_path: file.path
          });
        }
      }
  
      await connection.commit();
      res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error submitting application:', error);
      res.status(500).json({ success: false, message: 'Error submitting application' });
    } finally {
      connection.release();
    }
  });


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});