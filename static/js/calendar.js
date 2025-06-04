import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const entryDisplay = document.getElementById('entryDisplay');
  const prevEntryBtn = document.getElementById('prevEntry');
  const nextEntryBtn = document.getElementById('nextEntry');

  let entries = [];
  let currentIndex = -1;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    dateClick: async function (info) {
      const selectedDate = info.dateStr;
      const entry = await getEntryByDate(selectedDate);
      if (entry) {
        entryDisplay.value = entry.content;
        currentIndex = entries.findIndex(e => e.date === selectedDate);
      } else {
        entryDisplay.value = 'No entry for this date.';
        currentIndex = -1;
      }
    }
  });

  calendar.render();

  async function getEntries() {
    const q = query(collection(db, 'entries'));
    const querySnapshot = await getDocs(q);
    entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ date: doc.id, content: doc.data().content });
    });
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async function getEntryByDate(date) {
    if (entries.length === 0) {
      await getEntries();
    }
    return entries.find(entry => entry.date === date);
  }

  prevEntryBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      const entry = entries[currentIndex];
      entryDisplay.value = entry.content;
      calendar.gotoDate(entry.date);
    }
  });

  nextEntryBtn.addEventListener('click', () => {
    if (currentIndex < entries.length - 1) {
      currentIndex++;
      const entry = entries[currentIndex];
      entryDisplay.value = entry.content;
      calendar.gotoDate(entry.date);
    }
  });

  // Initial load
  getEntries();
});
