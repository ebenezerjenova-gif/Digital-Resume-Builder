// ---------- Data storage (sync with DOM) ----------
let educationEntries = [
    { degree: "B.Sc. Computer Science", institution: "Stanford University", year: "2020-2024" }
];
let experienceEntries = [
    { title: "Lead Designer", company: "CreativeStudio", duration: "2022 – Present" },
    { title: "UI Designer", company: "BrandLab", duration: "2020 – 2022" }
];

// Profile picture storage
let currentProfileImage = "";

// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render education list in form UI
function renderEducationListUI() {
    const container = document.getElementById('educationList');
    if (!container) return;
    container.innerHTML = '';
    educationEntries.forEach((edu, idx) => {
        const div = document.createElement('div');
        div.className = 'list-entry';
        div.setAttribute('data-idx', idx);
        div.innerHTML = `
            <span><strong>${escapeHtml(edu.degree)}</strong> - ${escapeHtml(edu.institution)} (${escapeHtml(edu.year)})</span>
            <button type="button" class="remove-item" data-type="edu" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
        `;
        container.appendChild(div);
    });
    attachRemoveListeners();
}

// Render experience list in form UI
function renderExperienceListUI() {
    const container = document.getElementById('experienceList');
    if (!container) return;
    container.innerHTML = '';
    experienceEntries.forEach((exp, idx) => {
        const div = document.createElement('div');
        div.className = 'list-entry';
        div.setAttribute('data-idx', idx);
        div.innerHTML = `
            <span><strong>${escapeHtml(exp.title)}</strong> at ${escapeHtml(exp.company)} • ${escapeHtml(exp.duration)}</span>
            <button type="button" class="remove-item" data-type="exp" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
        `;
        container.appendChild(div);
    });
    attachRemoveListeners();
}

// Attach remove event listeners to delete buttons
function attachRemoveListeners() {
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.removeEventListener('click', handleRemove);
        btn.addEventListener('click', handleRemove);
    });
}

// Handle removal of education or experience entries
function handleRemove(e) {
    const btn = e.currentTarget;
    const type = btn.getAttribute('data-type');
    const idx = parseInt(btn.getAttribute('data-idx'), 10);
    if (type === 'edu') {
        educationEntries.splice(idx, 1);
        renderEducationListUI();
    } else if (type === 'exp') {
        experienceEntries.splice(idx, 1);
        renderExperienceListUI();
    }
    updatePreviewFromForm();
}

// Add new education entry
function addEducation() {
    const degree = document.getElementById('eduDegree').value.trim();
    const institution = document.getElementById('eduInstitution').value.trim();
    const year = document.getElementById('eduYear').value.trim();
    if (!degree && !institution && !year) {
        alert("Please fill at least one field for education");
        return;
    }
    educationEntries.push({
        degree: degree || "Degree",
        institution: institution || "Institution",
        year: year || "Year"
    });
    renderEducationListUI();
    // Clear inputs
    document.getElementById('eduDegree').value = '';
    document.getElementById('eduInstitution').value = '';
    document.getElementById('eduYear').value = '';
    updatePreviewFromForm();
}

// Add new experience entry
function addExperience() {
    const title = document.getElementById('expTitle').value.trim();
    const company = document.getElementById('expCompany').value.trim();
    const duration = document.getElementById('expDuration').value.trim();
    if (!title && !company && !duration) {
        alert("Fill at least one field for experience");
        return;
    }
    experienceEntries.push({
        title: title || "Role",
        company: company || "Company",
        duration: duration || "Date"
    });
    renderExperienceListUI();
    document.getElementById('expTitle').value = '';
    document.getElementById('expCompany').value = '';
    document.getElementById('expDuration').value = '';
    updatePreviewFromForm();
}

// Handle profile picture (upload or URL)
function handleProfilePicture() {
    const fileInput = document.getElementById('profilePicUpload');
    const urlInput = document.getElementById('profilePicUrl');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentProfileImage = e.target.result;
            updatePreviewFromForm();
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (urlInput.value.trim() !== "") {
        currentProfileImage = urlInput.value.trim();
        updatePreviewFromForm();
    } else {
        // No change, but still update preview to reflect removal if both cleared
        if (!fileInput.files.length && !urlInput.value.trim()) {
            currentProfileImage = "";
            updatePreviewFromForm();
        }
    }
}

// Validate required fields
function validateBasicFields() {
    let valid = true;
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    
    if (!name) { 
        nameError.innerText = "Name is required"; 
        valid = false; 
    } else { 
        nameError.innerText = ""; 
    }
    
    if (!email) { 
        emailError.innerText = "Email is required"; 
        valid = false; 
    } else if (!/^\S+@\S+\.\S+$/.test(email)) { 
        emailError.innerText = "Enter valid email"; 
        valid = false; 
    } else { 
        emailError.innerText = ""; 
    }
    return valid;
}

// Build resume HTML from current form data
function buildResumeHTML() {
    const name = document.getElementById('fullName').value.trim() || "Your Name";
    const jobTitle = document.getElementById('jobTitle').value.trim() || "Professional";
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const skillsRaw = document.getElementById('skills').value.trim();
    const skillsArray = skillsRaw.split(',').map(s => s.trim()).filter(s => s);
    
    const skillsHtml = skillsArray.length ? 
        `<div class="section">
            <div class="section-title"><i class="fas fa-code"></i> Skills</div>
            <div style="display: flex; flex-wrap:wrap; gap: 8px;">
                ${skillsArray.map(skill => `<span style="background:#eef2ff; padding:4px 12px; border-radius:40px; font-size:0.8rem;">${escapeHtml(skill)}</span>`).join('')}
            </div>
        </div>` : '';

    // Education HTML
    let eduHtml = '';
    if (educationEntries.length) {
        eduHtml = `<div class="section"><div class="section-title"><i class="fas fa-graduation-cap"></i> Education</div>`;
        educationEntries.forEach(edu => {
            eduHtml += `<div class="edu-item">
                <div class="edu-degree">${escapeHtml(edu.degree)}</div>
                <div class="edu-meta">${escapeHtml(edu.institution)} | ${escapeHtml(edu.year)}</div>
            </div>`;
        });
        eduHtml += `</div>`;
    }
    
    // Experience HTML
    let expHtml = '';
    if (experienceEntries.length) {
        expHtml = `<div class="section"><div class="section-title"><i class="fas fa-briefcase"></i> Experience</div>`;
        experienceEntries.forEach(exp => {
            expHtml += `<div class="exp-item">
                <div class="exp-title">${escapeHtml(exp.title)} @ ${escapeHtml(exp.company)}</div>
                <div class="exp-meta">${escapeHtml(exp.duration)}</div>
            </div>`;
        });
        expHtml += `</div>`;
    }

    // Profile picture area
    let profilePicHtml = '';
    if (currentProfileImage) {
        profilePicHtml = `<div class="avatar-placeholder">
            <img src="${currentProfileImage}" alt="profile" class="avatar-img" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\'fas fa-user-circle avatar-icon\'></i>';">
        </div>`;
    } else {
        profilePicHtml = `<div class="avatar-placeholder"><i class="fas fa-user-circle avatar-icon"></i></div>`;
    }

    return `
        <div class="profile-area">
            ${profilePicHtml}
            <div class="name-title">
                <h1>${escapeHtml(name)}</h1>
                <div class="tagline">${escapeHtml(jobTitle)}</div>
                <div class="contact-row">
                    ${email ? `<span><i class="fas fa-envelope"></i> ${escapeHtml(email)}</span>` : ''}
                    ${phone ? `<span><i class="fas fa-phone-alt"></i> ${escapeHtml(phone)}</span>` : ''}
                    ${location ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}</span>` : ''}
                </div>
            </div>
        </div>
        ${summary ? `<div class="section">
            <div class="section-title"><i class="fas fa-user-astronaut"></i> Profile</div>
            <p style="line-height:1.4;">${escapeHtml(summary)}</p>
        </div>` : ''}
        ${eduHtml}
        ${expHtml}
        ${skillsHtml}
    `;
}

// Update the preview panel
function updatePreviewFromForm() {
    const valid = validateBasicFields();
    const resumeContainer = document.getElementById('resumeContent');
    if (!resumeContainer) return;
    
    if (!valid) {
        resumeContainer.innerHTML = buildResumeHTML() + 
            `<div style="background:#fff1f0; margin-top:12px; padding:8px; border-radius:20px; color:#b91c1c;">
                <i class="fas fa-exclamation-triangle"></i> Please fix validation errors (Name/Email) before PDF download.
            </div>`;
    } else {
        resumeContainer.innerHTML = buildResumeHTML();
    }
}

// Download PDF using html2pdf
async function downloadPDF() {
    const valid = validateBasicFields();
    if (!valid) {
        alert("Please fill required fields: Name and valid Email before generating PDF.");
        return;
    }
    
    const element = document.getElementById('resumePreviewContainer');
    if (!element) return;
    
    const btn = document.getElementById('downloadPDFBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Generating...';
    btn.disabled = true;

    try {
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${document.getElementById('fullName').value.trim() || 'Resume'}_Resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error(err);
        alert("PDF error: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Bind all form event listeners
function bindFormEvents() {
    const fields = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'summary', 'skills'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => updatePreviewFromForm());
    });
    
    document.getElementById('profilePicUpload').addEventListener('change', () => handleProfilePicture());
    document.getElementById('profilePicUrl').addEventListener('input', () => handleProfilePicture());
    document.getElementById('addEducationBtn').addEventListener('click', () => { 
        addEducation(); 
        updatePreviewFromForm(); 
    });
    document.getElementById('addExperienceBtn').addEventListener('click', () => { 
        addExperience(); 
        updatePreviewFromForm(); 
    });
    document.getElementById('refreshPreviewBtn').addEventListener('click', () => updatePreviewFromForm());
    document.getElementById('downloadPDFBtn').addEventListener('click', downloadPDF);
}

// Initialize the application
function init() {
    renderEducationListUI();
    renderExperienceListUI();
    bindFormEvents();
    updatePreviewFromForm();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);