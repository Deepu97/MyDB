////open and saveOpen file
let fileHandle;  // Stores the selected file handle
let fileContent = ""; // Stores the file content

// Function to Open a File
async function openFile() {
    try {
        // Show file picker and get the file handle
        [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Text Files',
                accept: {'text/plain': ['.txt']}
            }]
        });

        // Get file contents
        const file = await fileHandle.getFile();
        fileContent = await file.text();

        alert("File opened successfully!\n\n" + fileContent);
    } catch (error) {
        console.error("Error opening file:", error);
    }
}

// Function to Save a Modified File
async function saveFile() {
    if (!fileHandle) {
        alert("No file opened!");
        return;
    }

    try {
        // Get permission to write
        const writable = await fileHandle.createWritable();
        //get Data from the local storage and write in a file
       console.log(localStorage.getItem("localSQLDB"))
        // Modify file content
        // fileContent += "\nNew data appended!";
        fileContent += localStorage.getItem("localSQLDB")

        // Write new content and close the file
        await writable.write(fileContent);
        await writable.close();

        alert("File saved successfully!");
    } catch (error) {
        console.error("Error saving file:", error);
    }
}




////////////////////
class LocalSQL {
    constructor(dbName = "localSQLDB") {
        this.dbName = dbName;
        this.initDB();
    }

    // Initialize database in localStorage
    initDB() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify({}));
        }
    }

    // Get database object
    getDB() {
        return JSON.parse(localStorage.getItem(this.dbName));
    }

    // Save database object
    saveDB(db) {
        localStorage.setItem(this.dbName, JSON.stringify(db));
    }

    // Execute SQL query
    execute(query) {
        const tokens = query.trim().split(/\s+/);
        const command = tokens[0].toUpperCase();

        switch (command) {
            case "CREATE": return this.createTable(tokens);
            case "INSERT": return this.insertInto(tokens);
            case "SELECT": return this.selectFrom(tokens);
            case "UPDATE": return this.updateTable(tokens);
            case "DELETE": return this.deleteFrom(tokens);
            case "JOIN": return this.joinTables(tokens);
            case "ORDER": return this.orderBy(tokens);
            case "LIMIT": return this.limitResults(tokens);
            default: throw new Error("Invalid SQL command");
        }
    }

    // CREATE TABLE users (id INT, name TEXT, age INT);
    createTable(tokens) {
        const tableName = tokens[2];
        let db = this.getDB();

        if (db[tableName]) {
            throw new Error(`Table '${tableName}' already exists`);
        }

        db[tableName] = [];
        this.saveDB(db);
        return `Table '${tableName}' created successfully`;
    }

    // INSERT INTO users (id, name, age) VALUES (1, 'John', 25);
    insertInto(tokens) {
        const tableName = tokens[2];
        const db = this.getDB();

        if (!db[tableName]) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const columns = tokens.slice(3, tokens.indexOf("VALUES")).join("").replace(/[()]/g, "").split(",");
        console.log(columns);
        const values = tokens.slice(tokens.indexOf("VALUES") + 1).join("").replace(/[()]/g, "").split(",");
        console.log(values);

        let row = {};
        columns.forEach((col, i) => row[col.trim()] = values[i].trim().replace(/['"]/g, ""));
        db[tableName].push(row);
        this.saveDB(db);

        return `Row inserted into '${tableName}' successfully`;
    }

    // SELECT * FROM users;
    selectFrom(tokens) {
        const tableName = tokens[3];
        
        const db = this.getDB();
                                
        if (!db[tableName]) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        let result = db[tableName];
        

        if (tokens.includes("ORDER")) {
            result = this.orderBy(tokens, result);
        }

        if (tokens.includes("LIMIT")) {
            result = this.limitResults(tokens, result);
        }

        return result;
    }

    // UPDATE users SET age = 30 WHERE id = 1;
    updateTable(tokens) {
        const tableName = tokens[1];
        const db = this.getDB();
        
        if (!db[tableName]) {
            throw new Error(`Table '${tableName}' does not exist`);
        }
        
        const setIndex = tokens.indexOf("SET");
        const whereIndex = tokens.indexOf("WHERE");
        const updates = tokens.slice(setIndex + 1, whereIndex).join("").split(",");
        const conditions = tokens.slice(whereIndex + 1).join("").split("=");
        
        db[tableName].forEach(row => {
            if (row[conditions[0].trim()] == conditions[1].trim()) {
                updates.forEach(update => {
                    const [col, value] = update.split("=");
                    row[col.trim()] = value.trim().replace(/['"]/g, "");
                });
            }
        });
        
        this.saveDB(db);
        return `Table '${tableName}' updated successfully`;
    }

    // DELETE FROM users WHERE id = 1;
    deleteFrom(tokens) {
        const tableName = tokens[2];
        const db = this.getDB();

        if (!db[tableName]) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const conditions = tokens.slice(tokens.indexOf("WHERE") + 1).join("").split("=");
        db[tableName] = db[tableName].filter(row => row[conditions[0].trim()] != conditions[1].trim());
        this.saveDB(db);
        return `Rows deleted from '${tableName}' successfully`;
    }

    // JOIN operation (basic inner join)
    joinTables(tokens) {
        return "JOIN operation not yet implemented.";
    }

    // ORDER BY operation
    orderBy(tokens, result) {
        const orderIndex = tokens.indexOf("BY") + 1;
        const column = tokens[orderIndex];
        const order = tokens[orderIndex + 1] && tokens[orderIndex + 1].toUpperCase() === "DESC" ? "DESC" : "ASC";
        return result.sort((a, b) => order === "ASC" ? a[column] - b[column] : b[column] - a[column]);
    }

    // LIMIT operation
    limitResults(tokens, result) {
        const limitIndex = tokens.indexOf("LIMIT") + 1;
        const limit = parseInt(tokens[limitIndex], 10);
        return result.slice(0, limit);
    }
}

// Example Usage
const db = new LocalSQL();

console.log(db.execute("CREATE TABLE users (id INT, name TEXT, age INT);"));
console.log(db.execute("INSERT INTO users (id, name, age) VALUES (1, 'John', 25);"));
console.log(db.execute("SELECT * FROM users ORDER BY age DESC LIMIT 1;"));
console.log(db.execute("UPDATE users SET age = 30 WHERE id = 1;"));
console.log(db.execute("DELETE FROM users WHERE id = 1;"));

////get Data from inputBox and pass this input box value into class method excute();

function executeQuery(){
    const tab=document.getElementById('tab');

    let inp=document.getElementById('inp');
    const hello=db.execute(inp.value);
    console.log(hello);
    
    ////create a dynamicall table in html where we display our user data when we run select query
    
   //when select command is run it create a table in html and show all data
    hello.forEach((ele)=>{
        //create tr and td using js 
        const tr=document.createElement('tr');
        const td=document.createElement('td');
       const td1=document.createElement('td');
        const td2=document.createElement('td');
        console.log(ele);
        //styling the tr AND td which we make dynamically
        tr.style.textAlign="center";
        td.style.border="1px solid black";
        td1.style.border="1px solid black";
        td2.style.border="1px solid black";
        /////////////////////////////////////////////////

        //write text in td 
        td.innerText=ele.id;
        td1.innerText=ele.name;
        td2.innerText=ele.age;
        /////////////////

        //td append in tr
        tr.appendChild(td);
        tr.appendChild(td1);
        tr.appendChild(td2);
        //tr now append in table element
        tab.appendChild(tr);
    })
    inp.value="";



    
    
     //  db.selectFrom(inp.value);
    



}

