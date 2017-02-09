; (function () {
    var inputName = document.getElementById("nameInput"), // Элемент input имени товара.
        inputCount = document.getElementById("countInput"), // Элемент input количества товара.
        inputPrice = document.getElementById("priceInput"), // Элемент input цены товара.
        flagName, // Флаг корректности имени товара.
        flagCount, // Флаг корректности количества товара.
        flagPrice; // Флаг корректности цены товара.
    document.getElementById("priceStore").value = 0; // Начальное значение цены для помещения в хранилище.
    document.getElementById("correctness").value = 0; // Начальное значение корректности ввода.
    console.log("inputName: " + inputName);

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

    function resetInput() { // Очистка полей input при обновлении страницы.
        inputName.value = inputCount.value = inputPrice.value = "";
        flagName = flagCount = flagPrice = false; // Сброс флагов корректности ввода.
        document.getElementById("priceStore").value = 0; // Сброс значения цены для помещения в хранилище.
        document.getElementById("correctness").value = 0; // Сброс значения корректности ввода.
    }

    function nameCheck(e) {
        var nameMask = /\b[a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9 _,;:\\\/\-\.\+\*\(\)]{0,14}\b/,
            elems = inputName.parentElement.children;
        console.log("elems: " + elems);

        resetError(elems.nameInput.parentElement);
        var nameInputText = elems.nameInput.value.trim(); // Удалить хвостовые пробелы.
        if (nameInputText === "") {
            showError(elems.nameInput.parentElement, "* Поле не может быть пустым");
            if (e) { e.preventDefault() };
            return;
        } else {
            if (!nameMask.test(nameInputText)) {
                showError(elems.nameInput.parentElement, "* Поле должно быть от 1 до 15 символов");
                if (e) { e.preventDefault() };
                return;
            }
        }
        inputName.value = nameInputText; // Значение input будет без хвостовых пробелов.
        flagName = true; // Имя товара корректно.
        correctnessControl(); // Проверка корректности ввода.
        var passedValue2 = document.getElementById("correctness").value;
        console.log("nameCheck: передаваемое значение: " + passedValue2);
    }

    function countCheck(evt) { // Проверка символов на цифры по одному.
        var nameMask = /\d+/,
            elems = inputCount.parentElement.children;

        resetError(elems.countInput.parentElement);

        // Получить объект события.
        var e = evt || window.evt; // Модель стандартная или IE.
        var countSymbol; // Введённый неизвестный символ.

        // Получить введённый символ.
        // Введённый печатаемый символ в Firefox сохраняется в свойстве charCode.
        var code = e.charCode || e.keyCode;

        // Если была нажата какая-либо функциональная клавиша, не фильтровать её.
        if (code < 32 || // Управляющий символ ASCII.
			e.charCode === 0 || // Функциональная клавиша (в Firefox).
			e.ctrlKey || e.altKey) { // Удерживаемая клавиша-модификатор.
            return;	// Не фильтровать это событие.
        }

        // Преобразовать код символа в строку.
        countSymbol = String.fromCharCode(code);

        console.log("countSymbol: " + countSymbol);
        if (!nameMask.test(countSymbol)) {
            showError(elems.countInput.parentElement, "* Нужно вводить цифры");
            e.preventDefault(); // Предотвратить вставку символа.
        } else {
            flagCount = true; // Количество товара корректно.
            correctnessControl(); // Проверка корректности ввода.
        }
    }

    function countDeny(e) { // Запрещение копирования из буфера обмена.
        var elems = inputCount.parentElement.children;
        console.log("countDeny() e.type: " + e.type);
        console.log("countDeny() inputCount.value: " + inputCount.value);
        resetError(elems.countInput.parentElement);
        showError(elems.countInput.parentElement, "* Нельзя копировать из буфера обмена");
        e.preventDefault(); // Предотвратить вставку текста.
    }

    function priceCheck(evt) { // Проверка символов по одному.
        var nameMask = /[\d\.]/,
            elems = inputPrice.parentElement.children;

        resetError(elems.priceInput.parentElement);

        // Получить объект события.
        var e = evt || window.evt; // Модель стандартная или IE.
        var priceSymbol; // Введённый неизвестный символ.

        // Получить введённый символ.
        // Введённый печатаемый символ в Firefox сохраняется в свойстве charCode.
        var code = e.charCode || e.keyCode;

        // Если была нажата какая-либо функциональная клавиша, не фильтровать её.
        if (code < 32 || // Управляющий символ ASCII.
			e.charCode === 0 || // Функциональная клавиша (в Firefox).
			e.ctrlKey || e.altKey) { // Удерживаемая клавиша-модификатор.
            return;	// Не фильтровать это событие.
        }

        // Преобразовать код символа в строку.
        priceSymbol = String.fromCharCode(code);

        console.log("priceSymbol: " + priceSymbol);
        if (!nameMask.test(priceSymbol)) { // Введён неверный символ.
            showError(elems.priceInput.parentElement, "* Введите цифры или десятичную точку");
            e.preventDefault(); // Предотвратить вставку символа.
        }
    }

    function toMoneySum(number) { // Преобразование денежной суммы в строковое представление.
        var numStr = Math.round(number * 100) / 100 + ""; // Округлить до 2 десятичных знаков.
        var countPoint = numStr.length; // Позиция для отсчёта целой и дробной частей.
        var commaPos = numStr.indexOf("."); // -1, если нет точки
        if (~commaPos) {
            countPoint = commaPos; // Расположение десятичной точки.
        }
        var fractionPart = ""; // Дробная часть.
        for (var m = countPoint + 1; m < countPoint + 3; m++) {
            if (numStr[m]) { // Если десятичный знак есть, то прибавляем его к строке.
                fractionPart += numStr[m];
            } else { // Если десятичного знака нет, то прибавляем "0" к строке.
                fractionPart += "0";
            }
        }
        var integerPart = ""; // Целая часть.
        var k = countPoint - 1; // Индекс наименьшего десятичного разряда.
        console.log("##########");
        console.log("k: " + k);
        console.log("==========");
        outerLabel: for (var i = Math.floor((countPoint + 2) / 3) ; i > 0; i--) { // Метка.
            for (var j = 0; j < 3; j++) {
                console.log("i: " + i + ";   j: " + j + ";   k: " + k + ";");
                integerPart = numStr[k] + integerPart; // Присоединение десятичного разряда.
                console.log("integerPart: " + integerPart);
                k--; // Декремент индекса.
                if (k < 0) {
                    console.log("==========");
                    console.log("i: " + i + ";   j: " + j + ";   k: " + k + ";");
                    console.log("integerPart: " + integerPart);
                    console.log("++++++++++");
                    break outerLabel; // Выход из обоих циклов for.
                }
            }
            console.log("----------");
            integerPart = "," + integerPart; // Присоединение разделителя тысяч.
            console.log("integerPart: " + integerPart);
            console.log("----------");
        }
        // Соединение знака "$", целой части, десятичной точки и дробной части.
        return "$" + integerPart + "." + fractionPart;
    }

    function priceFormat() { // Формат по завершении редактирования.
        var elems = inputPrice.parentElement.children;
        console.log("elems: " + elems);

        resetError(elems.priceInput.parentElement);
        var priceNumber = +elems.priceInput.value; // Преобразование к числовому значению.
        console.log("priceFormat: priceNumber: " + priceNumber);
        if (isNaN(priceNumber)) {
            showError(elems.priceInput.parentElement, "* Введено не число. Повторите ввод");
        } else {
            document.getElementById("priceStore").value = priceNumber; // Значение цены для хранилища.
            inputPrice.value = toMoneySum(priceNumber); // Представление денежной суммы.
            flagPrice = true; // Цена товара корректна.
            correctnessControl(); // Проверка корректности ввода.
        }
    }

    function priceDeny(e) { // Запрещение копирования из буфера обмена.
        var elems = inputPrice.parentElement.children;
        console.log("priceDeny() e.type: " + e.type);
        console.log("priceDeny() inputPrice.value: " + inputPrice.value);
        resetError(elems.priceInput.parentElement);
        showError(elems.priceInput.parentElement, "* Нельзя копировать из буфера обмена");
        e.preventDefault(); // Предотвратить вставку текста.
    }

    function correctnessControl() { // Проверка корректности ввода.
        console.log("correctnessControl: flagName: " + flagName + ";   flagCount: " + flagCount + ";   flagPrice: " + flagPrice + ";");
        if (flagName && flagCount && flagPrice) { // Сведения о товаре корректны.
            document.getElementById("correctness").value = 1; // true
            var passedValue = document.getElementById("correctness").value;
            console.log("correctnessControl: передаваемое значение: " + passedValue);
        }
    }

    // Очистка полей input, сброс флагов и значения корректности для удаления сведений от предыдущего ввода.
    document.getElementById("addNewButton").addEventListener("click", resetInput, false);
    document.getElementById("addNewInModal").addEventListener("click", resetInput, false);
    window.addEventListener("load", resetInput, false); // Очистка поля input при обновлении.
    nameCheck(); // Проверка имени до появления фокуса.
    inputName.addEventListener("blur", nameCheck, false); // Проверка имени при потере фокуса.
    inputCount.addEventListener("keypress", countCheck, false); // Проверка количества по символу.
    inputCount.addEventListener("paste", countDeny); // Запретить ввод из буфера обмена.
    inputPrice.addEventListener("keypress", priceCheck, false); // Проверка цены по символу.
    inputPrice.addEventListener("paste", priceDeny); // Запретить ввод из буфера обмена.
    inputPrice.addEventListener("blur", priceFormat, false); // Проверка всей цены и её форматирование.
})();
