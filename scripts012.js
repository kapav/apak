; (function () {
    var prodList = {}; // Хранение всех объектов, связанных с базой данных indexedDB.
    prodList.db = null; // Размещение объекта базы данных.
    prodList.description = "База данных для локального хранения перечня торваров.";
    prodList.name = "localProdListStorage"; // Имя базы данных.
    prodList.version = 1;
    prodList.storeName = "prodObjects"; // Имя хранилища в базе данных.
    prodList.message = ""; // Для отображения строк HTML.
    prodList.empty = true; // Существует ли одна или более записей в хранилище БД.
    var prodElem = {}; // Элемент перечня товаров.

    function requiredFeaturesSupported() {
        switch (window.location.protocol) { // Страницы IndexedDB должны работать через протокол http или https (или для приложений в новом Windows UI через протокол ms-wwa или ms-wwa-web).
            case "http:":
                break;
            case "https:":
                break;
            case "ms-wwa-web:": // Для приложений в новом Windows UI, IndexedDB работает в локальном контенте, загруженном в веб-контент.
                break;
            case "ms-wwa:": // Для приложений в новом Windows UI, IndexedDB работает в локальном контенте.
                break;
            default:
                document.getElementById("bodyElement").innerHTML = "<h3>Страницы IndexedDB должны работать через протокол http:// или https:// - устраните это несоответствие и запустите страницу вновь.</h3>";
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
                document.getElementById("bodyElement").innerHTML = "<h3>IndexedDB не поддерживается - обновите свой браузер до последней версии.</h3>";
                return false;
            }
        } // if

        return true;
    } // requiredFeaturesSupported

    if (requiredFeaturesSupported()) {
        openDb(); // Создаёт и открывает БД.
        displayDb(null, listRow); // Отображает БД.
        console.log("prodList.Emply: " + prodList.empty);
    }

    if (requiredFeaturesSupported()) {
        // Добавить обработчики событий для двух клавиш.
        document.getElementById("searchButton").addEventListener("click", searchProd, false);
        document.getElementById("addNewInModal").addEventListener("click", addProd, false);
    } // if

    function displayMessage(message) {
        document.getElementById("messages").innerHTML = message;
    } // displayMessage

    function showError(container, errorMessage) { // Отобразить ошибку.
        var msgElem = document.createElement("span");
        msgElem.id = "errorMsg";
        msgElem.innerHTML = errorMessage;
        container.appendChild(msgElem);
    }

    function resetError(container) { // Сбросить ошибку.
        if (container.lastChild.id === "errorMsg") {
            container.removeChild(container.lastChild);
        }
    }

    function openDb() { // Создаёт и открывает БД.
        console.log("openDb()");

        var openRequest = window.indexedDB.open(prodList.name, prodList.version); // Также передаётся как параметр факультативное значение версии для данной базы данных.

        openRequest.onerror = function (evt) { console.log(" Произошло событие openRequest.onerror в openDB() - ошибка: " + (evt.target.error ? evt.target.error : evt.target.errorCode)); } // Некоторые браузеры могут поддерживать только свойство errorCode.
        openRequest.onblocked = openDbOnblocked; // Данное событие возбуждается, если база данных открыта другим процессом: подобныи или отличающимся.
        openRequest.onupgradeneeded = openDbOnupgradeneeded; // Данное событие возбуждается, если база данных не существует или её версия отличается от текущей.
        openRequest.onsuccess = openDbOnsuccess; // Попытка открытия существующей базы данных, версия которой совпадает с текущей.
    }

    function openDbOnblocked(evt) {
        console.log("openDbOnblocked()");

        var message = "<p>База данных заблокирована - код ошибки: " + (evt.target.error ? evt.target.error : evt.target.errorCode) + "</p>";
        message += "</p>Если данная страница открыта в другом окне браузера, закройте данные окна.</p>";

        displayMessage(message);
    }

    function openDbOnupgradeneeded(evt) {
        console.log("openDbOnupgradeneeded()");

        var db = prodList.db = evt.target.result; // Успешно открытая база данных выдаёт как результат объект базы данных, который помещается в объект для хранения всех объектов БД.

        if (!db) {
            console.log("БД (другими словами, evt.target.result) равна null в openDbOnupgradeneeded()");
            return;
        } // if

        try {
            db.createObjectStore(prodList.storeName, { keyPath: "id", autoIncrement: true }); // Создать хранилище объектов, в котором каждому объекту будет дано автоинкрементное свойство "id".
        }
        catch (ex) {
            console.log("Возбуждено исключение в openDB_onupgradeneeded() - " + ex.message);
            return;
        }

        prodList.message = "<p>База данных создана.</p>"; // Способ сообщения данной информации обработчику openDbOnsuccess.
    } // openDbOnupgradeneeded

    function openDbOnsuccess(evt) {
        console.log("openDbOnsuccess()");

        var db = prodList.db = evt.target.result; // Успешно открытая база данных выдаёт как результат объект базы данных, который помещается в объект для хранения всех объектов БД.

        if (!db) {
            console.log("БД (другими словами, evt.target.result) равна null в openDbOnsuccess()");
            return;
        } // if

        prodList.message += "<p>База данных открыта.</p>";
        displayMessage(prodList.message);
        prodList.message = ""; // Поле сообщения очищается после отправки пользователю.
    } // openDbOnsuccess

    function addProd(e) {
        console.log("addProd()");
        var addButton = document.getElementById("addNewInModal"); // Клавиша добавления.
        var assumedValue = !!+document.getElementById("correctness").value; // Принимаемое значение.
        console.log("addProd: принимаемое значение: " + assumedValue);

        resetError(addButton.parentElement);
        if (assumedValue) { // Корректность сведений о товаре.
            prodElem.name = document.getElementById("nameInput").value; // Имя товара.
            prodElem.count = +document.getElementById("countInput").value; // Количество товара.
            var priceRound = +document.getElementById("priceStore").value; // Для округления.
            prodElem.price = Math.round(priceRound * 100) / 100; // Цена товара.
            console.log("addProd: Имя товара: " + prodElem.name + ";   Количество: " + prodElem.count + ";   Цена: " + prodElem.price + ";");
        } else {
            e.preventDefault(); // Предотвратить нажатие клавиши.
            showError(addButton.parentElement, "* Поля должны быть заполнены");
            return;
        }

        var db = prodList.db;
        if (!db) {
            console.log("БД (другими словами, prodList.db) равна null в addProd()");
            return;
        } // if

        var transaction; // Представляет группу операций на базе данных.
        var ex; // Исключение.
        try { // Запускает транзакцию на заданном хранилище объектов.
            transaction = db.transaction(prodList.storeName, (IDBTransaction.READ_WRITE ? IDBTransaction.READ_WRITE : "readwrite")); // Возможно как успешное завершение, так и возбуждение исключения. Тернарный оператор нужен браузерам, которые поддерживают только значение READ_WRITE.
        } // try
        catch (ex) {
            console.log("Возбуждено исключение в методе db.transaction() в addProd() - " + ex.message);
            return;
        } // catch

        transaction.onerror = function (evt) { console.log("Произошло событие transaction.onerror в addProd() - код ошибки: " + (evt.target.error ? evt.target.error : evt.target.errorCode)); }
        transaction.onabort = function () { console.log("Произошло событие transaction.onabort в addProd()"); }
        transaction.oncomplete = function () { console.log("Произошло событие transaction.oncomplete в addProd()"); }

        try { // Возвращает хранилище объектов, которое вовлечено в транзакцию.
            var objectStore = transaction.objectStore(prodList.storeName);

            // Добавляет записываемый объект в хранилище объектов.
            var addRequest = objectStore.add(prodElem);
            addRequest.onsuccess = function() {
                prodList.empty = false; // Теперь как минимум один объект в хранилище
            } // объектов. Информация prodList.empty будет использована при отображении БД.
            addRequest.onerror = function (evt) {
                console.log("Произошло событие addRequest.onerror в addProd() - код ошибки: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
            }
        } // try
        catch (ex) {
            console.log("Возбуждено исключение в методе transaction.objectStore() и/или методе objectStore.add() в addProd() - " + ex.message);
            return;
        } // catch
    } // addProd

    function displayDb(searchRange, representRow) { // searchRange - шаблон имени товара, ограничивающий выборку курсора заданным набором значений имён товара.
        // representRow - отрисовка строки, соответствующей одному товару.
        console.log("displayDb()");

        var db = prodList.db;

        if (!db) {
            displayMessage("<p>Отсутствует база данных для показа.</p>");
            console.log("БД (другими словами, prodList.db) равна null в displayDb()");
        }

        var transaction; // Представляет группу операций на базе данных.
        try { // Запускает транзакцию на заданном хранилище объектов.
            transaction = db.transaction(prodList.storeName, (IDBTransaction.READ_ONLY ? IDBTransaction.READ_ONLY : "readonly")); // Возможно как успешное завершение, так и возбуждение исключения. Тернарный оператор нужен браузерам, которые поддерживают только значение READ_ONLY.
        } catch (ex) { 
            console.log("Возбуждено исключение в методе db.transaction() в displayDB() - " + ex.message);
            return;
        } // catch

        try { // Возвращает хранилище объектов, которое вовлечено в транзакцию.
            var objectStore = transaction.objectStore(prodList.storeName);

            try { 
                // Запрос может вернуть несколько результатов, поэтому следует использовать объект курсора.
                // Возвращаемый объект курсора размещается на первой записи в источнике данных и может факультативно иметь в качестве параметра объект диапазона и объект направления сортировки.
                // При создании курсора можно факультативно создать объект диапазона, представляющий диапазон ключей.
                var nameRange; // Диапазон с равными начальной и конечной границами - шаблон имени.
                var cursorRequest; // Курсор факультативно имеет как параметр объект диапазона.
                if (searchRange == null) { // Если отсутствует шаблон имени товара, то отображать всё.
                    cursorRequest = objectStore.openCursor();
                } else {
                    nameRange = new IDBKeyRange.only(searchRange); // Диапазон с одним ключом.
                    var nameIndex = objectStore.index("name"); // Получить индекс по именам товара.
                    cursorRequest = nameIndex.openCursor(nameRange);
                }

                cursorRequest.onerror = function(evt) {
                    console.log("Произошло событие cursorRequest.onerror в displayDB() - код ошибки: " + (evt.target.error ? evt.target.error : evt.target.errorCode));
                }

                var prodListHtml; // Здесь отрисовать общий для всех строк верх таблицы, если нужно.
                document.getElementsByTagName("tbody")[0].innerHTML = ""; // Удалить старую таблицу перед отрисовкой новой.

                cursorRequest.onsuccess = function(evt) { // Передать курсор этой функции.
                    console.log("Произошло событие cursorRequest.onsuccess в displayDB()");
                    // Этот обработчик событий будет вызван несколько раз, по одному для каждой записи, соответствующей запросу, и ещё один раз с пустым курсором, указывающим на окончание результатов.

                    var cursor = evt.target.result; // Получить совокупность объектов хранилища (всех или из заданного диапазона) с указателем на первом объекте.

                    if (cursor) {
                        prodList.empty = false; // Есть как минимум один объект в хранилище базы данных. Следовательно, БД не пуста.
                        var prodElemCursor = cursor.value; // Текущий объект товара.
                        representRow(prodElemCursor); // Отрисовать строку.
                        cursor.continue(); // Перейти к следующему объекту товара.
                    } else {
                        // Здесь отрисовать общий для всех строк низ таблицы, если нужно.
                    }

                    if (prodList.empty) {
                        displayMessage("<p>База данных пуста &ndash; отсутствует содержимое для показа.</p>");
                    }
                } // cursorRequest.onsuccess
            } catch (innerException) {
                console.log("Возбуждено исключение во внутренней конструкции try в displayDb() - " + innerException.message);
            } // inner catch
        } catch (outerException) {
            console.log("Возбуждено исключение во внешней конструкции try в displayDb() - " + outerException.message);
        } // outer catch
    } // displayDb

    function searchProd() {
        console.log("searchProd()");
    }

    function listRow(prodCursor) { // Отрисовывает строку перечня.
        console.log("listRow()");
        var trRowText = document.getElementById("rowBlock").innerHTML; // Текст элемента tr.
        var tbodyRowNode = document.getElementsByTagName("tbody")[0]; // Сам элемент tbody.
        var trRowNode = document.createElement("tr"); // Элемент tr для добавления.
        trRowNode.innerHTML = trRowText; // Добавление текста в элемент tr.
        tbodyRowNode.appendChild(trRowNode); // Добавление tr в tbody.
    }

})();
