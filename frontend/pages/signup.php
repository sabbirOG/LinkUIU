<?php
require_once '../includes/session.php';

// Redirect if already authenticated
redirectIfAuthenticated();

// Initialize variables for form handling
$error_message = '';
$success_message = '';
$form_data = [];

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf_token)) {
        $error_message = 'Invalid security token. Please refresh the page and try again.';
    } else {
        // Process form data
        $form_data = [
            'name' => trim($_POST['name'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'student_id' => trim($_POST['student_id'] ?? ''),
            'password' => $_POST['password'] ?? '',
            'confirm_password' => $_POST['confirm_password'] ?? '',
            'user_type' => $_POST['user_type'] ?? 'student',
            'department_id' => (int)($_POST['department_id'] ?? 0),
            'batch_id' => !empty($_POST['batch_id']) ? (int)$_POST['batch_id'] : null
        ];
        
        // Basic validation
        if (empty($form_data['name'])) {
            $error_message = 'Name is required.';
        } elseif (empty($form_data['email']) || !filter_var($form_data['email'], FILTER_VALIDATE_EMAIL)) {
            $error_message = 'Valid email address is required.';
        } elseif (empty($form_data['student_id']) || !preg_match('/^01\d{8}$/', $form_data['student_id'])) {
            $error_message = 'Valid student ID is required (10 digits starting with 01).';
        } elseif (empty($form_data['password']) || strlen($form_data['password']) < 8) {
            $error_message = 'Password must be at least 8 characters long.';
        } elseif ($form_data['password'] !== $form_data['confirm_password']) {
            $error_message = 'Passwords do not match.';
        } elseif ($form_data['department_id'] <= 0) {
            $error_message = 'Please select a department.';
        } elseif ($form_data['user_type'] === 'student' && empty($form_data['batch_id'])) {
            $error_message = 'Batch is required for students.';
        } else {
            // Make API call to backend
            try {
                $payload = [
                    'name' => $form_data['name'],
                    'email' => $form_data['email'],
                    'student_id' => $form_data['student_id'],
                    'password' => $form_data['password'],
                    'user_type' => $form_data['user_type'],
                    'department_id' => $form_data['department_id'],
                    'batch_id' => $form_data['batch_id']
                ];
                
                $result = makeApiCall('/auth/signup', 'POST', $payload, false);
                
                // Automatically log in the user after successful signup
                try {
                    $loginPayload = [
                        'email' => $form_data['email'],
                        'password' => $form_data['password']
                    ];
                    
                    $loginResult = makeApiCall('/auth/login', 'POST', $loginPayload, false);
                    
                    // Store authentication data in session
                    $_SESSION['auth_token'] = $loginResult['token'];
                    $_SESSION['auth_user'] = $loginResult['user'];
                    
                    // Also store token in localStorage for JavaScript API calls
                    echo '<script>
                        localStorage.setItem("auth_token", "' . addslashes($loginResult['token']) . '");
                        localStorage.setItem("auth_user", ' . json_encode($loginResult['user']) . ');
                    </script>';
                    
                    $success_message = 'Account created successfully! You are now logged in. Redirecting to dashboard...';
                    // Redirect to dashboard after 2 seconds
                    header("refresh:2;url=./dashboard.php");
                } catch (Exception $loginError) {
                    // If auto-login fails, redirect to login page
                    $success_message = 'Account created successfully! Please log in to continue.';
                    header("refresh:2;url=./login.php");
                }
            } catch (Exception $e) {
                $error_message = $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign up - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    // Department data organized by program level
    const departments = {
      undergraduate: [
        { id: 1, name: 'CSE (Computer Science & Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 2, name: 'EEE (Electrical & Electronic Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 5, name: 'CE (Civil Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 12, name: 'Data Science', school: 'School of Science and Engineering (SoSE)' },
        { id: 3, name: 'BBA (Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 4, name: 'BBA in AIS (Accounting Information System)', school: 'School of Business and Economics (SoBE)' },
        { id: 6, name: 'ECO (Economics)', school: 'School of Business and Economics (SoBE)' },
        { id: 7, name: 'EDS (Environment and Development Studies)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 8, name: 'English (English Language & Literature)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 11, name: 'MSJ (Media Studies and Journalism)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 9, name: 'BGE (Biotechnology & Genetic Engineering)', school: 'School of Life Sciences (SoLS)' },
        { id: 10, name: 'Pharmacy', school: 'School of Life Sciences (SoLS)' }
      ],
      graduate: [
        { id: 13, name: 'MBA (Master of Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 14, name: 'EMBA (Executive Master of Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 15, name: 'MSCSE (Master of Science in Computer Science & Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 16, name: 'MDS (Master in Development Studies)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 17, name: 'M.Sc. in Economics', school: 'School of Business and Economics (SoBE)' }
      ]
    };

    // Update departments based on program level
    function updateDepartments() {
      const programLevel = document.getElementById('program_level').value;
      const departmentSelect = document.getElementById('department_id');
      
      // Clear existing options
      departmentSelect.innerHTML = '<option value="">Select Department</option>';
      
      if (programLevel && departments[programLevel]) {
        let currentSchool = '';
        departments[programLevel].forEach(dept => {
          // Add school header if it's different from the previous one
          if (dept.school !== currentSchool) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = dept.school;
            departmentSelect.appendChild(optgroup);
            currentSchool = dept.school;
          }
          
          const option = document.createElement('option');
          option.value = dept.id;
          option.textContent = dept.name;
          departmentSelect.appendChild(option);
        });
      }
    }

    // Update batch field visibility based on user type
    function updateBatchFieldVisibility() {
      const userType = document.getElementById('user_type').value;
      const batchField = document.getElementById('batch_field');
      const batchSelect = document.getElementById('batch_id');
      
      if (userType === 'student') {
        batchField.style.display = 'block';
        batchSelect.required = true;
        batchSelect.innerHTML = '<option value="">Select Batch (Required for Students)</option>';
      } else if (userType === 'alumni') {
        batchField.style.display = 'block';
        batchSelect.required = false;
        batchSelect.innerHTML = '<option value="">Select Batch (Optional for Alumni)</option>';
      } else {
        batchField.style.display = 'none';
        batchSelect.required = false;
        batchSelect.innerHTML = '<option value="">Select Batch</option>';
      }
      
      // Update batches when field becomes visible
      if (batchField.style.display !== 'none') {
        updateBatches();
      }
    }

    // Update batches based on program level
    function updateBatches() {
      const programLevel = document.getElementById('program_level').value;
      const batchSelect = document.getElementById('batch_id');
      
      // Clear existing options
      batchSelect.innerHTML = '<option value="">Select Batch (Optional)</option>';
      
      if (programLevel === 'undergraduate') {
        // All available batches from database
        const option28 = document.createElement('option');
        option28.value = 28;
        option28.textContent = 'Batch 11';
        batchSelect.appendChild(option28);
        const option29 = document.createElement('option');
        option29.value = 29;
        option29.textContent = 'Batch 12';
        batchSelect.appendChild(option29);
        const option30 = document.createElement('option');
        option30.value = 30;
        option30.textContent = 'Batch 13';
        batchSelect.appendChild(option30);
        const option31 = document.createElement('option');
        option31.value = 31;
        option31.textContent = 'Batch 21';
        batchSelect.appendChild(option31);
        const option32 = document.createElement('option');
        option32.value = 32;
        option32.textContent = 'Batch 22';
        batchSelect.appendChild(option32);
        const option33 = document.createElement('option');
        option33.value = 33;
        option33.textContent = 'Batch 23';
        batchSelect.appendChild(option33);
        const option34 = document.createElement('option');
        option34.value = 34;
        option34.textContent = 'Batch 31';
        batchSelect.appendChild(option34);
        const option35 = document.createElement('option');
        option35.value = 35;
        option35.textContent = 'Batch 32';
        batchSelect.appendChild(option35);
        const option36 = document.createElement('option');
        option36.value = 36;
        option36.textContent = 'Batch 33';
        batchSelect.appendChild(option36);
        const option37 = document.createElement('option');
        option37.value = 37;
        option37.textContent = 'Batch 41';
        batchSelect.appendChild(option37);
        const option38 = document.createElement('option');
        option38.value = 38;
        option38.textContent = 'Batch 42';
        batchSelect.appendChild(option38);
        const option39 = document.createElement('option');
        option39.value = 39;
        option39.textContent = 'Batch 43';
        batchSelect.appendChild(option39);
        const option40 = document.createElement('option');
        option40.value = 40;
        option40.textContent = 'Batch 51';
        batchSelect.appendChild(option40);
        const option41 = document.createElement('option');
        option41.value = 41;
        option41.textContent = 'Batch 52';
        batchSelect.appendChild(option41);
        const option42 = document.createElement('option');
        option42.value = 42;
        option42.textContent = 'Batch 53';
        batchSelect.appendChild(option42);
        const option43 = document.createElement('option');
        option43.value = 43;
        option43.textContent = 'Batch 61';
        batchSelect.appendChild(option43);
        const option44 = document.createElement('option');
        option44.value = 44;
        option44.textContent = 'Batch 62';
        batchSelect.appendChild(option44);
        const option45 = document.createElement('option');
        option45.value = 45;
        option45.textContent = 'Batch 63';
        batchSelect.appendChild(option45);
        const option46 = document.createElement('option');
        option46.value = 46;
        option46.textContent = 'Batch 71';
        batchSelect.appendChild(option46);
        const option47 = document.createElement('option');
        option47.value = 47;
        option47.textContent = 'Batch 72';
        batchSelect.appendChild(option47);
        const option48 = document.createElement('option');
        option48.value = 48;
        option48.textContent = 'Batch 73';
        batchSelect.appendChild(option48);
        const option49 = document.createElement('option');
        option49.value = 49;
        option49.textContent = 'Batch 81';
        batchSelect.appendChild(option49);
        const option50 = document.createElement('option');
        option50.value = 50;
        option50.textContent = 'Batch 82';
        batchSelect.appendChild(option50);
        const option51 = document.createElement('option');
        option51.value = 51;
        option51.textContent = 'Batch 83';
        batchSelect.appendChild(option51);
        const option52 = document.createElement('option');
        option52.value = 52;
        option52.textContent = 'Batch 91';
        batchSelect.appendChild(option52);
        const option53 = document.createElement('option');
        option53.value = 53;
        option53.textContent = 'Batch 92';
        batchSelect.appendChild(option53);
        const option54 = document.createElement('option');
        option54.value = 54;
        option54.textContent = 'Batch 93';
        batchSelect.appendChild(option54);
        const option55 = document.createElement('option');
        option55.value = 55;
        option55.textContent = 'Batch 101';
        batchSelect.appendChild(option55);
        const option56 = document.createElement('option');
        option56.value = 56;
        option56.textContent = 'Batch 102';
        batchSelect.appendChild(option56);
        const option57 = document.createElement('option');
        option57.value = 57;
        option57.textContent = 'Batch 103';
        batchSelect.appendChild(option57);
        const option58 = document.createElement('option');
        option58.value = 58;
        option58.textContent = 'Batch 111';
        batchSelect.appendChild(option58);
        const option59 = document.createElement('option');
        option59.value = 59;
        option59.textContent = 'Batch 112';
        batchSelect.appendChild(option59);
        const option60 = document.createElement('option');
        option60.value = 60;
        option60.textContent = 'Batch 113';
        batchSelect.appendChild(option60);
        const option61 = document.createElement('option');
        option61.value = 61;
        option61.textContent = 'Batch 121';
        batchSelect.appendChild(option61);
        const option62 = document.createElement('option');
        option62.value = 62;
        option62.textContent = 'Batch 122';
        batchSelect.appendChild(option62);
        const option63 = document.createElement('option');
        option63.value = 63;
        option63.textContent = 'Batch 123';
        batchSelect.appendChild(option63);
        const option64 = document.createElement('option');
        option64.value = 64;
        option64.textContent = 'Batch 131';
        batchSelect.appendChild(option64);
        const option65 = document.createElement('option');
        option65.value = 65;
        option65.textContent = 'Batch 132';
        batchSelect.appendChild(option65);
        const option66 = document.createElement('option');
        option66.value = 66;
        option66.textContent = 'Batch 133';
        batchSelect.appendChild(option66);
        const option67 = document.createElement('option');
        option67.value = 67;
        option67.textContent = 'Batch 141';
        batchSelect.appendChild(option67);
        const option68 = document.createElement('option');
        option68.value = 68;
        option68.textContent = 'Batch 142';
        batchSelect.appendChild(option68);
        const option69 = document.createElement('option');
        option69.value = 69;
        option69.textContent = 'Batch 143';
        batchSelect.appendChild(option69);
        const option70 = document.createElement('option');
        option70.value = 70;
        option70.textContent = 'Batch 151';
        batchSelect.appendChild(option70);
        const option71 = document.createElement('option');
        option71.value = 71;
        option71.textContent = 'Batch 152';
        batchSelect.appendChild(option71);
        const option72 = document.createElement('option');
        option72.value = 72;
        option72.textContent = 'Batch 153';
        batchSelect.appendChild(option72);
        const option73 = document.createElement('option');
        option73.value = 73;
        option73.textContent = 'Batch 161';
        batchSelect.appendChild(option73);
        const option74 = document.createElement('option');
        option74.value = 74;
        option74.textContent = 'Batch 162';
        batchSelect.appendChild(option74);
        const option75 = document.createElement('option');
        option75.value = 75;
        option75.textContent = 'Batch 163';
        batchSelect.appendChild(option75);
        const option1 = document.createElement('option');
        option1.value = 1;
        option1.textContent = 'Batch 171';
        batchSelect.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = 2;
        option2.textContent = 'Batch 172';
        batchSelect.appendChild(option2);
        const option3 = document.createElement('option');
        option3.value = 3;
        option3.textContent = 'Batch 173';
        batchSelect.appendChild(option3);
        const option4 = document.createElement('option');
        option4.value = 4;
        option4.textContent = 'Batch 181';
        batchSelect.appendChild(option4);
        const option5 = document.createElement('option');
        option5.value = 5;
        option5.textContent = 'Batch 182';
        batchSelect.appendChild(option5);
        const option6 = document.createElement('option');
        option6.value = 6;
        option6.textContent = 'Batch 183';
        batchSelect.appendChild(option6);
        const option7 = document.createElement('option');
        option7.value = 7;
        option7.textContent = 'Batch 191';
        batchSelect.appendChild(option7);
        const option8 = document.createElement('option');
        option8.value = 8;
        option8.textContent = 'Batch 192';
        batchSelect.appendChild(option8);
        const option9 = document.createElement('option');
        option9.value = 9;
        option9.textContent = 'Batch 193';
        batchSelect.appendChild(option9);
        const option10 = document.createElement('option');
        option10.value = 10;
        option10.textContent = 'Batch 201';
        batchSelect.appendChild(option10);
        const option11 = document.createElement('option');
        option11.value = 11;
        option11.textContent = 'Batch 202';
        batchSelect.appendChild(option11);
        const option12 = document.createElement('option');
        option12.value = 12;
        option12.textContent = 'Batch 203';
        batchSelect.appendChild(option12);
        const option13 = document.createElement('option');
        option13.value = 13;
        option13.textContent = 'Batch 211';
        batchSelect.appendChild(option13);
        const option14 = document.createElement('option');
        option14.value = 14;
        option14.textContent = 'Batch 212';
        batchSelect.appendChild(option14);
        const option15 = document.createElement('option');
        option15.value = 15;
        option15.textContent = 'Batch 213';
        batchSelect.appendChild(option15);
        const option16 = document.createElement('option');
        option16.value = 16;
        option16.textContent = 'Batch 221';
        batchSelect.appendChild(option16);
        const option17 = document.createElement('option');
        option17.value = 17;
        option17.textContent = 'Batch 222';
        batchSelect.appendChild(option17);
        const option18 = document.createElement('option');
        option18.value = 18;
        option18.textContent = 'Batch 223';
        batchSelect.appendChild(option18);
        const option24 = document.createElement('option');
        option24.value = 24;
        option24.textContent = 'Batch 231';
        batchSelect.appendChild(option24);
        const option25 = document.createElement('option');
        option25.value = 25;
        option25.textContent = 'Batch 232';
        batchSelect.appendChild(option25);
        const option26 = document.createElement('option');
        option26.value = 26;
        option26.textContent = 'Batch 233';
        batchSelect.appendChild(option26);
        const option19 = document.createElement('option');
        option19.value = 19;
        option19.textContent = 'Batch 241';
        batchSelect.appendChild(option19);
        const option20 = document.createElement('option');
        option20.value = 20;
        option20.textContent = 'Batch 242';
        batchSelect.appendChild(option20);
        const option21 = document.createElement('option');
        option21.value = 21;
        option21.textContent = 'Batch 243';
        batchSelect.appendChild(option21);
        const option22 = document.createElement('option');
        option22.value = 22;
        option22.textContent = 'Batch 251';
        batchSelect.appendChild(option22);
        const option23 = document.createElement('option');
        option23.value = 23;
        option23.textContent = 'Batch 252';
        batchSelect.appendChild(option23);
        const option27 = document.createElement('option');
        option27.value = 27;
        option27.textContent = 'Batch 253';
        batchSelect.appendChild(option27);
      } else if (programLevel === 'graduate') {
        // All available batches from database
        const option28 = document.createElement('option');
        option28.value = 28;
        option28.textContent = 'Batch 11';
        batchSelect.appendChild(option28);
        const option29 = document.createElement('option');
        option29.value = 29;
        option29.textContent = 'Batch 12';
        batchSelect.appendChild(option29);
        const option30 = document.createElement('option');
        option30.value = 30;
        option30.textContent = 'Batch 13';
        batchSelect.appendChild(option30);
        const option31 = document.createElement('option');
        option31.value = 31;
        option31.textContent = 'Batch 21';
        batchSelect.appendChild(option31);
        const option32 = document.createElement('option');
        option32.value = 32;
        option32.textContent = 'Batch 22';
        batchSelect.appendChild(option32);
        const option33 = document.createElement('option');
        option33.value = 33;
        option33.textContent = 'Batch 23';
        batchSelect.appendChild(option33);
        const option34 = document.createElement('option');
        option34.value = 34;
        option34.textContent = 'Batch 31';
        batchSelect.appendChild(option34);
        const option35 = document.createElement('option');
        option35.value = 35;
        option35.textContent = 'Batch 32';
        batchSelect.appendChild(option35);
        const option36 = document.createElement('option');
        option36.value = 36;
        option36.textContent = 'Batch 33';
        batchSelect.appendChild(option36);
        const option37 = document.createElement('option');
        option37.value = 37;
        option37.textContent = 'Batch 41';
        batchSelect.appendChild(option37);
        const option38 = document.createElement('option');
        option38.value = 38;
        option38.textContent = 'Batch 42';
        batchSelect.appendChild(option38);
        const option39 = document.createElement('option');
        option39.value = 39;
        option39.textContent = 'Batch 43';
        batchSelect.appendChild(option39);
        const option40 = document.createElement('option');
        option40.value = 40;
        option40.textContent = 'Batch 51';
        batchSelect.appendChild(option40);
        const option41 = document.createElement('option');
        option41.value = 41;
        option41.textContent = 'Batch 52';
        batchSelect.appendChild(option41);
        const option42 = document.createElement('option');
        option42.value = 42;
        option42.textContent = 'Batch 53';
        batchSelect.appendChild(option42);
        const option43 = document.createElement('option');
        option43.value = 43;
        option43.textContent = 'Batch 61';
        batchSelect.appendChild(option43);
        const option44 = document.createElement('option');
        option44.value = 44;
        option44.textContent = 'Batch 62';
        batchSelect.appendChild(option44);
        const option45 = document.createElement('option');
        option45.value = 45;
        option45.textContent = 'Batch 63';
        batchSelect.appendChild(option45);
        const option46 = document.createElement('option');
        option46.value = 46;
        option46.textContent = 'Batch 71';
        batchSelect.appendChild(option46);
        const option47 = document.createElement('option');
        option47.value = 47;
        option47.textContent = 'Batch 72';
        batchSelect.appendChild(option47);
        const option48 = document.createElement('option');
        option48.value = 48;
        option48.textContent = 'Batch 73';
        batchSelect.appendChild(option48);
        const option49 = document.createElement('option');
        option49.value = 49;
        option49.textContent = 'Batch 81';
        batchSelect.appendChild(option49);
        const option50 = document.createElement('option');
        option50.value = 50;
        option50.textContent = 'Batch 82';
        batchSelect.appendChild(option50);
        const option51 = document.createElement('option');
        option51.value = 51;
        option51.textContent = 'Batch 83';
        batchSelect.appendChild(option51);
        const option52 = document.createElement('option');
        option52.value = 52;
        option52.textContent = 'Batch 91';
        batchSelect.appendChild(option52);
        const option53 = document.createElement('option');
        option53.value = 53;
        option53.textContent = 'Batch 92';
        batchSelect.appendChild(option53);
        const option54 = document.createElement('option');
        option54.value = 54;
        option54.textContent = 'Batch 93';
        batchSelect.appendChild(option54);
        const option55 = document.createElement('option');
        option55.value = 55;
        option55.textContent = 'Batch 101';
        batchSelect.appendChild(option55);
        const option56 = document.createElement('option');
        option56.value = 56;
        option56.textContent = 'Batch 102';
        batchSelect.appendChild(option56);
        const option57 = document.createElement('option');
        option57.value = 57;
        option57.textContent = 'Batch 103';
        batchSelect.appendChild(option57);
        const option58 = document.createElement('option');
        option58.value = 58;
        option58.textContent = 'Batch 111';
        batchSelect.appendChild(option58);
        const option59 = document.createElement('option');
        option59.value = 59;
        option59.textContent = 'Batch 112';
        batchSelect.appendChild(option59);
        const option60 = document.createElement('option');
        option60.value = 60;
        option60.textContent = 'Batch 113';
        batchSelect.appendChild(option60);
        const option61 = document.createElement('option');
        option61.value = 61;
        option61.textContent = 'Batch 121';
        batchSelect.appendChild(option61);
        const option62 = document.createElement('option');
        option62.value = 62;
        option62.textContent = 'Batch 122';
        batchSelect.appendChild(option62);
        const option63 = document.createElement('option');
        option63.value = 63;
        option63.textContent = 'Batch 123';
        batchSelect.appendChild(option63);
        const option64 = document.createElement('option');
        option64.value = 64;
        option64.textContent = 'Batch 131';
        batchSelect.appendChild(option64);
        const option65 = document.createElement('option');
        option65.value = 65;
        option65.textContent = 'Batch 132';
        batchSelect.appendChild(option65);
        const option66 = document.createElement('option');
        option66.value = 66;
        option66.textContent = 'Batch 133';
        batchSelect.appendChild(option66);
        const option67 = document.createElement('option');
        option67.value = 67;
        option67.textContent = 'Batch 141';
        batchSelect.appendChild(option67);
        const option68 = document.createElement('option');
        option68.value = 68;
        option68.textContent = 'Batch 142';
        batchSelect.appendChild(option68);
        const option69 = document.createElement('option');
        option69.value = 69;
        option69.textContent = 'Batch 143';
        batchSelect.appendChild(option69);
        const option70 = document.createElement('option');
        option70.value = 70;
        option70.textContent = 'Batch 151';
        batchSelect.appendChild(option70);
        const option71 = document.createElement('option');
        option71.value = 71;
        option71.textContent = 'Batch 152';
        batchSelect.appendChild(option71);
        const option72 = document.createElement('option');
        option72.value = 72;
        option72.textContent = 'Batch 153';
        batchSelect.appendChild(option72);
        const option73 = document.createElement('option');
        option73.value = 73;
        option73.textContent = 'Batch 161';
        batchSelect.appendChild(option73);
        const option74 = document.createElement('option');
        option74.value = 74;
        option74.textContent = 'Batch 162';
        batchSelect.appendChild(option74);
        const option75 = document.createElement('option');
        option75.value = 75;
        option75.textContent = 'Batch 163';
        batchSelect.appendChild(option75);
        const option1 = document.createElement('option');
        option1.value = 1;
        option1.textContent = 'Batch 171';
        batchSelect.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = 2;
        option2.textContent = 'Batch 172';
        batchSelect.appendChild(option2);
        const option3 = document.createElement('option');
        option3.value = 3;
        option3.textContent = 'Batch 173';
        batchSelect.appendChild(option3);
        const option4 = document.createElement('option');
        option4.value = 4;
        option4.textContent = 'Batch 181';
        batchSelect.appendChild(option4);
        const option5 = document.createElement('option');
        option5.value = 5;
        option5.textContent = 'Batch 182';
        batchSelect.appendChild(option5);
        const option6 = document.createElement('option');
        option6.value = 6;
        option6.textContent = 'Batch 183';
        batchSelect.appendChild(option6);
        const option7 = document.createElement('option');
        option7.value = 7;
        option7.textContent = 'Batch 191';
        batchSelect.appendChild(option7);
        const option8 = document.createElement('option');
        option8.value = 8;
        option8.textContent = 'Batch 192';
        batchSelect.appendChild(option8);
        const option9 = document.createElement('option');
        option9.value = 9;
        option9.textContent = 'Batch 193';
        batchSelect.appendChild(option9);
        const option10 = document.createElement('option');
        option10.value = 10;
        option10.textContent = 'Batch 201';
        batchSelect.appendChild(option10);
        const option11 = document.createElement('option');
        option11.value = 11;
        option11.textContent = 'Batch 202';
        batchSelect.appendChild(option11);
        const option12 = document.createElement('option');
        option12.value = 12;
        option12.textContent = 'Batch 203';
        batchSelect.appendChild(option12);
        const option13 = document.createElement('option');
        option13.value = 13;
        option13.textContent = 'Batch 211';
        batchSelect.appendChild(option13);
        const option14 = document.createElement('option');
        option14.value = 14;
        option14.textContent = 'Batch 212';
        batchSelect.appendChild(option14);
        const option15 = document.createElement('option');
        option15.value = 15;
        option15.textContent = 'Batch 213';
        batchSelect.appendChild(option15);
        const option16 = document.createElement('option');
        option16.value = 16;
        option16.textContent = 'Batch 221';
        batchSelect.appendChild(option16);
        const option17 = document.createElement('option');
        option17.value = 17;
        option17.textContent = 'Batch 222';
        batchSelect.appendChild(option17);
        const option18 = document.createElement('option');
        option18.value = 18;
        option18.textContent = 'Batch 223';
        batchSelect.appendChild(option18);
        const option24 = document.createElement('option');
        option24.value = 24;
        option24.textContent = 'Batch 231';
        batchSelect.appendChild(option24);
        const option25 = document.createElement('option');
        option25.value = 25;
        option25.textContent = 'Batch 232';
        batchSelect.appendChild(option25);
        const option26 = document.createElement('option');
        option26.value = 26;
        option26.textContent = 'Batch 233';
        batchSelect.appendChild(option26);
        const option19 = document.createElement('option');
        option19.value = 19;
        option19.textContent = 'Batch 241';
        batchSelect.appendChild(option19);
        const option20 = document.createElement('option');
        option20.value = 20;
        option20.textContent = 'Batch 242';
        batchSelect.appendChild(option20);
        const option21 = document.createElement('option');
        option21.value = 21;
        option21.textContent = 'Batch 243';
        batchSelect.appendChild(option21);
        const option22 = document.createElement('option');
        option22.value = 22;
        option22.textContent = 'Batch 251';
        batchSelect.appendChild(option22);
        const option23 = document.createElement('option');
        option23.value = 23;
        option23.textContent = 'Batch 252';
        batchSelect.appendChild(option23);
        const option27 = document.createElement('option');
        option27.value = 27;
        option27.textContent = 'Batch 253';
        batchSelect.appendChild(option27);
      }
    }


    // Password strength indicator
    function checkPasswordStrength() {
      const password = document.getElementById('password').value;
      const strengthIndicator = document.getElementById('password-strength');
      
      if (password.length === 0) {
        strengthIndicator.style.display = 'none';
        return;
      }
        
      strengthIndicator.style.display = 'block';
      
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
      const strengthColors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#00aa00'];
      
      strengthIndicator.textContent = `Password Strength: ${strengthText[strength]}`;
      strengthIndicator.style.color = strengthColors[strength];
    }

    // Password match indicator
    function checkPasswordMatch() {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;
      const matchIndicator = document.getElementById('password-match');
      
      if (confirmPassword.length === 0) {
        matchIndicator.style.display = 'none';
        return;
      }
      
      matchIndicator.style.display = 'block';
      
      if (password === confirmPassword) {
        matchIndicator.textContent = '✓ Passwords match';
        matchIndicator.style.color = '#00aa00';
      } else {
        matchIndicator.textContent = '✗ Passwords do not match';
        matchIndicator.style.color = '#ff4444';
      }
    }

    // Form validation
    function validateForm() {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const studentId = document.getElementById('student_id').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;
      const departmentId = document.getElementById('department_id').value;
      const userType = document.getElementById('user_type').value;
      const batchId = document.getElementById('batch_id').value;
      
      let isValid = true;
      let errorMessage = '';
      
      if (!name) {
        errorMessage += 'Name is required.\n';
        isValid = false;
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage += 'Valid email address is required.\n';
        isValid = false;
      }
      
      if (!studentId || !/^01\d{8}$/.test(studentId)) {
        errorMessage += 'Valid student ID is required (10 digits starting with 01).\n';
        isValid = false;
      }
      
      if (!password || password.length < 8) {
        errorMessage += 'Password must be at least 8 characters long.\n';
        isValid = false;
      }
      
      if (password !== confirmPassword) {
        errorMessage += 'Passwords do not match.\n';
        isValid = false;
      }
      
      if (!departmentId) {
        errorMessage += 'Please select a department.\n';
        isValid = false;
      }
      
      // Batch validation for students
      if (userType === 'student' && !batchId) {
        errorMessage += 'Batch is required for students.\n';
        isValid = false;
      }
      
      if (!isValid) {
        alert(errorMessage);
      }
      
      return isValid;
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      updateDepartments();
      updateBatches();
      updateBatchFieldVisibility();
      
      // Add event listeners
      document.getElementById('user_type').addEventListener('change', updateBatchFieldVisibility);
      document.getElementById('program_level').addEventListener('change', () => {
        updateDepartments();
        updateBatches();
      });
      
      document.getElementById('password').addEventListener('input', checkPasswordStrength);
      document.getElementById('confirm_password').addEventListener('input', checkPasswordMatch);
      document.getElementById('password').addEventListener('input', checkPasswordMatch);
      
      // Form submission
      document.getElementById('signup-form').addEventListener('submit', (e) => {
        if (!validateForm()) {
          e.preventDefault();
        }
      });
    });
  </script>
  <style> 
    body { background: linear-gradient(180deg,#fff,#fff8f1); } 
    
    .horizontal-card {
      display: flex;
      max-width: 1200px;
      width: 100%;
      min-height: 320px;
      margin: 0 auto;
    }
    
    .card-left {
      flex: 1;
      background: linear-gradient(135deg, #FF6F00 0%, #F57C00 50%, #FF9800 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 25px;
      border-radius: 20px 0 0 20px;
      position: relative;
      overflow: hidden;
    }
    
    .card-left::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hexagons" width="30" height="26" patternUnits="userSpaceOnUse"><polygon points="15,2 25,8 25,18 15,24 5,18 5,8" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23hexagons)"/></svg>');
      opacity: 0.4;
    }
    
    .card-left::after {
      content: '';
      position: absolute;
      top: -30%;
      right: -30%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
      border-radius: 50%;
      animation: rotate 20s linear infinite;
    }
    
    .card-left .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }
    
    .card-left .floating-shapes::before {
      content: '●';
      position: absolute;
      top: 20%;
      left: 15%;
      font-size: 20px;
      color: rgba(255,255,255,0.2);
      animation: float 4s ease-in-out infinite;
    }
    
    .card-left .floating-shapes::after {
      content: '▲';
      position: absolute;
      bottom: 25%;
      right: 20%;
      font-size: 16px;
      color: rgba(255,255,255,0.15);
      animation: float 3s ease-in-out infinite reverse;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .card-left .brand {
      text-align: center;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    
    .card-left .brand-badge {
      font-size: 4rem;
      margin-bottom: 20px;
      text-shadow: 0 4px 8px rgba(0,0,0,0.3);
      animation: float 3s ease-in-out infinite;
    }
    
    .card-left .subtitle {
      font-size: 1.4rem;
      font-weight: 600;
      opacity: 0.95;
      color: white !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      margin-bottom: 10px;
    }
    
    .card-left .description {
      font-size: 1rem;
      opacity: 0.8;
      color: white !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      max-width: 250px;
      line-height: 1.4;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .card-right {
      flex: 1;
      padding: 25px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .card-right .field {
      margin-bottom: 15px;
    }
    
    .card-right .label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }
    
    .card-right .input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    
    .card-right .btn {
      margin-top: 10px;
    }
    
    @media (max-width: 768px) {
      .horizontal-card {
        flex-direction: column;
        max-width: 400px;
        min-height: auto;
      }
      
      .card-left {
        border-radius: 20px 20px 0 0;
        padding: 20px;
      }
      
      .card-right {
        padding: 20px;
      }
    }
    
    .password-strength {
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    
    .success {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #c3e6cb;
    }
    
    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #f5c6cb;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand-left">
        <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
      </div>
      <div class="brand-center"></div>
      <div class="brand-right">
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./landing.html'" style="cursor: pointer;" />
      </div>
      <button class="hamburger" aria-label="Toggle mobile menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav">
        <span class="nav-link" onclick="location.href='./landing.html'" style="cursor: pointer;">Home</span>
        <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
        <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connect</span>
        <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
        <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Directory</span>
        <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
        <a href="./login.php" class="btn btn-primary">Login</a>
      </nav>
    </div>
    
    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <div class="mobile-nav-content">
        <div class="mobile-nav-header">
          <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" style="height: 30px;" />
          <button class="mobile-nav-close" aria-label="Close mobile menu">&times;</button>
        </div>
        <div class="mobile-nav-links">
          <span onclick="location.href='./landing.html'; closeMobileMenu();" style="cursor: pointer;">Home</span>
          <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
          <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connect</span>
          <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
          <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Directory</span>
          <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
          <a href="./login.php" class="btn btn-primary">Login</a>
        </div>
      </div>
    </div>
  </header>
  <div class="centered">
    <div class="card horizontal-card">
      <div class="card-left">
        <div class="floating-shapes"></div>
        <div class="brand">
          <div class="brand-badge">🎓</div>
          <div>
            <div class="subtitle">Join the UIU Community</div>
            <div class="description">Connect with fellow students and alumni. Build your network and advance your career together.</div>
          </div>
        </div>
      </div>
      <div class="card-right">
        <form id="signup-form" method="POST" action="">
          <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
          
          <?php if ($error_message): ?>
            <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
          <?php endif; ?>
          
          <?php if ($success_message): ?>
            <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
          <?php endif; ?>
          
        <div class="field">
          <label class="label">I am a</label>
          <select class="input" name="user_type" id="user_type" required>
            <option value="">Select your status</option>
              <option value="student" <?php echo ($form_data['user_type'] ?? '') === 'student' ? 'selected' : ''; ?>>Current Student</option>
              <option value="alumni" <?php echo ($form_data['user_type'] ?? '') === 'alumni' ? 'selected' : ''; ?>>Alumni</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Full name</label>
            <input class="input" name="name" placeholder="Your Name" value="<?php echo htmlspecialchars($form_data['name'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">UIU Email</label>
            <input class="input" name="email" placeholder="name@bscse.uiu.ac.bd" value="<?php echo htmlspecialchars($form_data['email'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">Student ID</label>
            <input class="input" name="student_id" placeholder="011XXXXXXX" pattern="01\d{8}" value="<?php echo htmlspecialchars($form_data['student_id'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">Program Level</label>
          <select class="input" name="program_level" id="program_level" required onchange="updateDepartments()">
            <option value="">Select Program Level</option>
            <option value="undergraduate">Undergraduate Program</option>
            <option value="graduate">Graduate Program</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Department</label>
          <select class="input" name="department_id" id="department_id" required>
            <option value="">Select Program Level First</option>
          </select>
        </div>
        <div class="field" id="batch_field">
          <label class="label">Batch/Trimester</label>
          <select class="input" name="batch_id" id="batch_id">
            <option value="">Select Batch (Required for Students)</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input class="input" type="password" name="password" id="password" placeholder="At least 8 chars, letters and numbers" required />
          <div id="password-strength" class="password-strength" style="display: none;"></div>
        </div>
        <div class="field">
          <label class="label">Confirm Password</label>
          <input class="input" type="password" name="confirm_password" id="confirm_password" placeholder="Confirm your password" required />
          <div id="password-match" class="password-strength" style="display: none;"></div>
        </div>
        <button class="btn btn-primary" type="submit">Create account</button>
        <div id="error" class="error"></div>
          <div id="msg" class="success"></div>
          <div class="mt-16">Already have an account? <a href="./login.php">Login</a></div>
        </form>
      </div>
    </div>
  </div>

  <script>
    // Mobile navigation functionality
    function closeMobileMenu() {
      document.querySelector('.mobile-nav').classList.remove('active');
    }

    // Mobile menu toggle
    document.querySelector('.mobile-nav-toggle').addEventListener('click', () => {
      document.querySelector('.mobile-nav').classList.add('active');
    });

    document.querySelector('.mobile-nav-close').addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking outside
    document.querySelector('.mobile-nav').addEventListener('click', (e) => {
      if (e.target.classList.contains('mobile-nav')) {
        closeMobileMenu();
      }
    });
  </script>
</body>
</html>
