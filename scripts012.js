; (function () {
    var prodList = {}; // �������� ���� ��������, ��������� � ����� ������ indexedDB.
    prodList.db = null; // ���������� ������� ���� ������.
    prodList.description = "���� ������ ��� ���������� �������� ������� ��������.";
    prodList.name = "localProdListStorage"; // ��� ���� ������.
    prodList.version = 1;
    prodList.storeName = "prodObjects"; // ��� ��������� � ���� ������.
    prodList.message = ""; // ��� ����������� ����� HTML.
    prodList.empty = true; // ���������� �� ���� ��� ����� ������� � ��������� ��.
    var prodElem = {}; // ������� ������� �������.

    function requiredFeaturesSupported() {
        switch (window.location.protocol) { // �������� IndexedDB ������ �������� ����� �������� http ��� https (��� ��� ���������� � ����� Windows UI ����� �������� ms-wwa ��� ms-wwa-web).
            case "http:":
                break;
            case "https:":
                break;
            case "ms-wwa-web:": // ��� ���������� � ����� Windows UI, IndexedDB �������� � ��������� ��������, ����������� � ���-�������.
                break;
            case "ms-wwa:": // ��� ���������� � ����� Windows UI, IndexedDB �������� � ��������� ��������.
                break;
            default:
                document.getElementById("bodyElement").innerHTML = "<h3>�������� IndexedDB ������ �������� ����� �������� http:// ��� https:// - ��������� ��� �������������� � ��������� �������� �����.</h3>";
                return true;
        } // switch

        if (!window.indexedDB) {
            if (window.mozIndexedDB) {
                window.indexedDB = window.mozIndexedDB;
            }
            else if (window.webkitIndexedDB) {
                window.indexedDB = webkitIndexedDB;
                IDBCursor = webkitIDBCursor;
                IDBDatabaseException = webkitIDBDatabaseException;
                IDBRequest = webkitIDBRequest;
                IDBKeyRange = webkitIDBKeyRange;
                IDBTransaction = webkitIDBTransaction;
            }
            else {
                document.getElementById("bodyElement").innerHTML = "<h3>IndexedDB �� �������������� - �������� ���� ������� �� ��������� ������.</h3>";
                return false;
            }
        } // if

        return true;
    } // requiredFeaturesSupported

    if (requiredFeaturesSupported()) {
        openDb(); // ������ � ��������� ��.
        displayDb(null, listRow); // ���������� ��.
        console.log("prodList.Emply: " + prodList.empty);
    }

    if (requiredFeaturesSupported()) {
        // �������� ����������� ������� ��� ���� ������.
        document.getElementById("searchButton").addEventListener("click", searchProd, false);
        document.getElementById("addNewInModal").addEventListener("click", addProd, false);
    } // if

    function displayMessage(message) {
        document.getElementById("messages").innerHTML = message;
    } // displayMessage

    function showError(container, errorMessage) { // ���������� ������.
        var msgElem = document.createElement("span");
        msgElem.id = "errorMsg";
        msgElem.innerHTML = errorMessage;
        container.appendChild(msgElem);
    }

    function resetError(container) { // �������� ������.
        if (container.lastChild.id === "errorMsg") {
            container.removeChild(container.lastChild);
        }
    }

    function openDb() { // ������ � ��������� ��.
        console.log("openDb()");

        var openRequest = window.indexedDB.open(prodList.name, prodList.version); // ����� ��������� ��� �������� �������������� �������� ������ ��� ������ ���� ������.

        openRequest.onerror = function (evt) { console.log(" ��������� ������� openRequest.onerror � openDB() - ������: " + (evt.target.error ? evt.target.error : evt.target.errorCode)); } // ��������� �������� ����� ������������ ������ �������� errorCode.
        openRequest.onblocked = openDbOnblocked; // ������ ������� ������������, ���� ���� ������ ������� ������ ���������: �������� ��� ������������.
        openRequest.onupgradeneeded = openDbOnupgradeneeded; // ������ ������� ������������, ���� ���� ������ �� ���������� ��� � ������ ���������� �� �������.
        openRequest.onsuccess = openDbOnsuccess; // ������� �������� ������������ ���� ������, ������ ������� ��������� � �������.
    }

    function openDbOnblocked(evt) {
        console.log("openDbOnblocked()");

        var message = "<p>���� ������ ������������� - ��� ������: " + (evt.target.error ? evt.target.error : evt.target.errorCode) + "</p>";
        message += "</p>���� ������ �������� ������� � ������ ���� ��������, �������� ������ ����.</p>";

        displayMessage(message);
    }

    function openDbOnupgradeneeded(evt) {
        console.log("openDbOnupgradeneeded()");

        var db = prodList.db = evt.target.result; // ������� �������� ���� ������ ����� ��� ��������� ������ ���� ������, ������� ���������� � ������ ��� �������� ���� �������� ��.

        if (!db) {
            console.log("�� (������� �������, evt.target.result) ����� null � openDbOnupgradeneeded()");
            return;
        } // if

        try {
            db.createObjectStore(prodList.storeName, { keyPath: "id", autoIncrement: true }); // ������� ��������� ��������, � ������� ������� ������� ����� ���� ���������������� �������� "id".
        }
        catch (ex) {
            console.log("���������� ���������� � openDB_onupgradeneeded() - " + ex.message);
            return;
        }

        prodList.message = "<p>���� ������ �������.</p>"; // ������ ��������� ������ ���������� ����������� openDbOnsuccess.
    } // openDbOnupgradeneeded

    function openDbOnsuccess(evt) {
        console.log("openDbOnsuccess()");

        var db = prodList.db = evt.target.result; // ������� �������� ���� ������ ����� ��� ��������� ������ ���� ������, ������� ���������� � ������ ��� �������� ���� �������� ��.

        if (!db) {
            console.log("�� (������� �������, evt.target.result) ����� null � openDbOnsuccess()");
            return;
        } // if

        prodList.message += "<p>���� ������ �������.</p>";
        displayMessage(prodList.message);
        prodList.message = ""; // ���� ��������� ��������� ����� �������� ������������.
    } // openDbOnsuccess

    function addProd(e) {
        console.log("addProd()");
        var addButton = document.getElementById("addNewInModal"); // ������� ����������.
        var assumedValue = !!+document.getElementById("correctness").value; // ����������� ��������.
        console.log("addProd: ����������� ��������: " + assumedValue);

        resetError(addButton.parentElement);
        if (assumedValue) { // ������������ �������� � ������.
            prodElem.name = document.getElementById("nameInput").value; // ��� ������.
            prodElem.count = +document.getElementById("countInput").value; // ���������� ������.
            var priceRound = +document.getElementById("priceStore").value; // ��� ����������.
            prodElem.price = Math.round(priceRound * 100) / 100; // ���� ������.
            console.log("addProd: ��� ������: " + prodElem.name + ";   ����������: " + prodElem.count + ";   ����: " + prodElem.price + ";");
        } else {
            e.preventDefault(); // ������������� ������� �������.
            showError(addButton.parentElement, "* ���� ������ ���� ���������");
            return;
        }

        var db = prodList.db;
        if (!db) {
            console.log("�� (������� �������, prodList.db) ����� null � addProd()");
            return;
        } // if

        var transaction; // ������������ ������ �������� �� ���� ������.
        var ex; // ����������.
        try { // ��������� ���������� �� �������� ��������� ��������.
            transaction = db.transaction(prodList.storeName, (IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : "readwrite")); // �������� ��� �������� ����������, ��� � ����������� ����������. ��������� �������� ����� ���������, ������� ������������ ������ �������� READ_WRITE.
        } // try
        catch (ex) {
            console.log("���������� ���������� � ������ db.transaction() � addProd() - " + ex.message);
            return;
        } // catch

        transaction.onerror = function (evt) { console.log("��������� ������� transaction.onerror � addProd() - ��� ������: " + (evt.target.error ? evt.target.error : evt.target.errorCode)); }
        transaction.onabort = function () { console.log("��������� ������� transaction.onabort � addProd()"); }
        transaction.oncomplete = function () { console.log("��������� ������� transaction.oncomplete � addProd()"); }

        try { // ���������� ��������� ��������, ������� ��������� � ����������.
            var objectStore = transaction.objectStore(prodList.storeName);

            // ��������� ������������ ������ � ��������� ��������.
            var addRequest = objectStore.add(prodElem);
            addRequest.onsuccess = function() {
                prodList.empty = false; // ������ ��� ������� ���� ������ � ���������
            } // ��������. ���������� prodList.empty ����� ������������ ��� ����������� ��.
            addRequest.onerror = function (evt) {
                console.log("��������� ������� addRequest.onerror � addProd() - ��� ������: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
            }
        } // try
        catch (ex) {
            console.log("���������� ���������� � ������ transaction.objectStore() �/��� ������ objectStore.add() � addProd() - " + ex.message);
            return;
        } // catch
    } // addProd

    function displayDb(searchRange, representRow) { // searchRange - ������ ����� ������, �������������� ������� ������� �������� ������� �������� ��� ������.
        // representRow - ��������� ������, ��������������� ������ ������.
        console.log("displayDb()");

        var db = prodList.db;

        if (!db) {
            displayMessage("<p>����������� ���� ������ ��� ������.</p>");
            console.log("�� (������� �������, prodList.db) ����� null � displayDb()");
        }

        var transaction; // ������������ ������ �������� �� ���� ������.
        try { // ��������� ���������� �� �������� ��������� ��������.
            transaction = db.transaction(prodList.storeName, (IDBTransaction.READ_ONLY ? IDBTransaction.READ_ONLY : "readonly")); // �������� ��� �������� ����������, ��� � ����������� ����������. ��������� �������� ����� ���������, ������� ������������ ������ �������� READ_ONLY.
        } catch (ex) { 
            console.log("���������� ���������� � ������ db.transaction() � displayDB() - " + ex.message);
            return;
        } // catch

        try { // ���������� ��������� ��������, ������� ��������� � ����������.
            var objectStore = transaction.objectStore(prodList.storeName);

            try { 
                // ������ ����� ������� ��������� �����������, ������� ������� ������������ ������ �������.
                // ������������ ������ ������� ����������� �� ������ ������ � ��������� ������ � ����� ������������� ����� � �������� ��������� ������ ��������� � ������ ����������� ����������.
                // ��� �������� ������� ����� ������������� ������� ������ ���������, �������������� �������� ������.
                var nameRange; // �������� � ������� ��������� � �������� ��������� - ������ �����.
                var cursorRequest; // ������ ������������� ����� ��� �������� ������ ���������.
                if (searchRange == null) { // ���� ����������� ������ ����� ������, �� ���������� ��.
                    cursorRequest = objectStore.openCursor();
                } else {
                    nameRange = new IDBKeyRange.only(searchRange); // �������� � ����� ������.
                    var nameIndex = objectStore.index("name"); // �������� ������ �� ������ ������.
                    cursorRequest = nameIndex.openCursor(nameRange);
                }

                cursorRequest.onerror = function(evt) {
                    console.log("��������� ������� cursorRequest.onerror � displayDB() - ��� ������: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
                }

                var prodListHtml; // ����� ���������� ����� ��� ���� ����� ���� �������, ���� �����.
                document.getElementsByTagName("tbody")[0].innerHTML = ""; // ������� ������ ������� ����� ���������� �����.

                cursorRequest.onsuccess = function(evt) { // �������� ������ ���� �������.
                    console.log("��������� ������� cursorRequest.onsuccess � displayDB()");
                    // ���� ���������� ������� ����� ������ ��������� ���, �� ������ ��� ������ ������, ��������������� �������, � ��� ���� ��� � ������ ��������, ����������� �� ��������� �����������.

                    var cursor = evt.target.result; // �������� ������������ �������� ��������� (���� ��� �� ��������� ���������) � ���������� �� ������ �������.

                    if (cursor) {
                        prodList.empty = false; // ���� ��� ������� ���� ������ � ��������� ���� ������. �������������, �� �� �����.
                        var prodElemCursor = cursor.value; // ������� ������ ������.
                        representRow(prodElemCursor); // ���������� ������.
                        cursor.continue(); // ������� � ���������� ������� ������.
                    } else {
                        // ����� ���������� ����� ��� ���� ����� ��� �������, ���� �����.
                    }

                    if (prodList.empty) {
                        displayMessage("<p>���� ������ ����� &ndash; ����������� ���������� ��� ������.</p>");
                    }
                } // cursorRequest.onsuccess
            } catch (innerException) {
                console.log("���������� ���������� �� ���������� ����������� try � displayDb() - " + innerException.message);
            } // inner catch
        } catch (outerException) {
            console.log("���������� ���������� �� ������� ����������� try � displayDb() - " + outerException.message);
        } // outer catch
    } // displayDb

    function searchProd() {
        console.log("searchProd()");
    }

    function listRow(prodCursor) { // ������������ ������ �������.
        console.log("listRow()");
        var trRowText = document.getElementById("rowBlock").innerHTML; // ����� �������� tr.
        var tbodyRowNode = document.getElementsByTagName("tbody")[0]; // ��� ������� tbody.
        var trRowNode = document.createElement("tr"); // ������� tr ��� ����������.
        trRowNode.innerHTML = trRowText; // ���������� ������ � ������� tr.
        tbodyRowNode.appendChild(trRowNode); // ���������� tr � tbody.
    }

})();
