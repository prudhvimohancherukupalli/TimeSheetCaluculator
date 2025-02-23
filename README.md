# Timesheet Calculator

## Description
Timesheet Calculator is a web application designed to help users log their working hours efficiently. Users can enter their clock-in and clock-out times, specify an optional date, and define an hourly rate. The application automatically calculates the total duration worked and the total earnings based on the hourly rate. The improved UI allows for better data management, editing, and report generation.

## Features
- **Clock In & Clock Out Logging**: Users can enter their working hours for different dates.
- **Auto-Date Incrementation**: If a date is not provided for consecutive entries, the previous date is automatically incremented.
- **Default Hourly Rate**: A default hourly rate is applied to all entries unless changed manually.
- **Editable Entries**: Users can modify existing records.
- **Delete Functionality**: Remove unwanted entries with ease.
- **Table Report Generation**: A structured table displaying work logs with total hours worked and total pay.
- **Print Functionality**: Print only the report section without unnecessary elements.
- **Responsive UI**: Optimized for web applications with a four-column layout for better usability.

## Live Demo
[Live Demo](#) *(https://animated-rolypoly-5120ec.netlify.app/)*

## Installation & Setup
1. **Clone the Repository**:
   ```sh
   git clone https://github.com/prudhvimohancherukupalli/TimeSheetCaluculator.git 
   ```
2. **Navigate to the Project Directory**:
   ```sh
   cd timesheet-calculator
   ```
3. **Install Dependencies**:
   ```sh
   npm install
   ```
4. **Start the Development Server**:
   ```sh
   npm start
   ```

## Usage Instructions
1. **Add a Work Entry**:
   - Select clock-in and clock-out times.
   - (Optional) Enter a date; if omitted, the previous entry's date will be incremented.
   - Specify the hourly rate only if different from the default.
   - Click the "Add Entry" button.
   
2. **Edit an Entry**:
   - Click the edit button next to an entry.
   - Modify any field and save the changes.

3. **Delete an Entry**:
   - Click the delete button next to an entry to remove it.

4. **Print Report**:
   - Click the "Print Report" button to print only the table and summary section.

## Folder Structure
```
root/
│-- src/
│   ├── components/
│   │   ├── Timesheet.js   # Main timesheet component
│   │   ├── Report.js      # Report and print functionality
│   ├── App.js            # Root component
│   ├── index.js          # Application entry point
│-- public/
│-- package.json
│-- README.md
```

## Technologies Used
- **React.js** - Frontend framework
- **Material-UI** - UI Components and styling
- **Day.js** - Date and time manipulation

## Contributing
We welcome contributions! If you’d like to improve the project, feel free to fork the repository and submit a pull request.

## License
This project is open-source and available under the [MIT License](LICENSE).

---
Update the live demo URL and repository link in the README before pushing it to GitHub.

