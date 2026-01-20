/**
 * tutors.js
 * Модуль для работы с репетиторами
 */

// Глобальные переменные
window.allTutors = [];
let filteredTutors = [];

/**
 * Отрисовка списка репетиторов
 * @param {Array} tutors - массив репетиторов для отображения
 */
function renderTutors(tutors) {
    window.allTutors = tutors;
    filteredTutors = tutors;
    
    const tableBody = document.getElementById('tutorsTableBody');
    
    if (tutors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="fas fa-user-graduate fs-1 text-muted mb-3"></i>
                    <h4>Нет доступных репетиторов</h4>
                    <p class="text-muted">В данный момент у нас нет свободных репетиторов. Пожалуйста, проверьте позже.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    tutors.forEach(tutor => {
        html += `
            <tr class="tutor-row" data-tutor-id="${tutor.id}">
                <td class="text-center" width="80">
                    <div class="rounded-circle overflow-hidden mx-auto" style="width: 60px; height: 60px; background-color: #f8f9fa;">
                        <img src="assets/images/placeholder.jpg" class="w-100 h-100 object-fit-cover" alt="${tutor.name}">
                    </div>
                </td>
                <td>
                    <div class="fw-bold">${tutor.name}</div>
                    <div class="text-muted small">Стаж: ${tutor.work_experience} лет</div>
                </td>
                <td>
                    <span class="badge bg-${getLevelBadgeType(tutor.language_level)}">${tutor.language_level}</span>
                </td>
                <td>
                    <div class="d-flex flex-wrap gap-1">
                        ${tutor.languages_offered.map(lang => `<span class="badge bg-secondary">${lang}</span>`).join('')}
                    </div>
                </td>
                <td class="text-center">${tutor.work_experience}</td>
                <td class="text-end fw-bold">${tutor.price_per_hour.toLocaleString('ru-RU')} ₽</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary" onclick="selectTutor(${tutor.id})">
                        <i class="fas fa-user-check me-1"></i>Выбрать
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Фильтрация репетиторов по выбранным критериям
 */
function filterTutors() {
    const languageFilter = document.getElementById('languageFilter').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value.toLowerCase();
    
    filteredTutors = window.allTutors.filter(tutor => {
        const languageMatch = languageFilter ? 
            tutor.languages_offered.some(lang => lang.toLowerCase().includes(languageFilter)) : true;
        
        const levelMatch = levelFilter ? 
            tutor.language_level.toLowerCase().includes(levelFilter) : true;
        
        return languageMatch && levelMatch;
    });
    
    renderTutors(filteredTutors);
}

/**
 * Выбор репетитора для заявки
 * @param {number} tutorId - ID выбранного репетитора
 */
function selectTutor(tutorId) {
    // Поиск репетитора в глобальном массиве с учетом типа данных
    const tutor = window.allTutors.find(t => t.id.toString() === tutorId.toString());
    
    if (!tutor) {
        console.error('Репетитор с ID', tutorId, 'не найден');
        showNotification('Ошибка: репетитор не найден', 'danger');
        return;
    }
    
    // Выделение выбранной строки
    document.querySelectorAll('.tutor-row').forEach(row => {
        row.classList.remove('table-primary');
    });
    document.querySelector(`.tutor-row[data-tutor-id="${tutorId}"]`).classList.add('table-primary');
    
    // Заполнение модального окна данными о репетиторе
    document.getElementById('orderId').value = '';
    document.getElementById('selectedTutorId').value = tutorId;
    document.getElementById('tutorName').value = tutor.name;
    
    // Установка типа заявки на "репетитор"
    document.getElementById('tutorOrder').checked = true;
    document.getElementById('courseSection').classList.add('d-none');
    document.getElementById('tutorSection').classList.remove('d-none');
    
    // Установка текущей даты как минимальной для выбора
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tutorDate').value = today;
    document.getElementById('tutorDate').min = today;
    
    // Сброс дополнительных опций
    document.querySelectorAll('#orderForm input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Сброс количества студентов
    document.getElementById('studentsNumber').value = 1;
    
    // Сброс цены
    document.getElementById('totalPrice').textContent = '0 ₽';
    document.getElementById('priceBreakdown').innerHTML = '';
    
    // Обновление расчета цены
    updatePriceCalculation();
    
    // Открытие модального окна
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

/**
 * Получение типа бейджа для уровня языка
 * @param {string} level - уровень языка
 * @returns {string} - тип бейджа Bootstrap
 */
function getLevelBadgeType(level) {
    const levelLower = level.toLowerCase();
    
    if (levelLower.includes('beginner') || levelLower.includes('начальный')) {
        return 'info';
    } else if (levelLower.includes('intermediate') || levelLower.includes('средний')) {
        return 'warning';
    } else if (levelLower.includes('advanced') || levelLower.includes('продвинутый')) {
        return 'success';
    } else if (levelLower.includes('expert') || levelLower.includes('эксперт')) {
        return 'danger';
    }
    
    return 'secondary';
}

// Добавление функций в глобальную область видимости
window.filterTutors = filterTutors;
window.selectTutor = selectTutor;