import "./style.css";

import alpine from "alpinejs";

const getTime = () => (new Date()).getTime(); 

const store = {
    key: window.location.href,
    write(data) {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (error) {
            alert(error?.toString());
        }
    },
    read(fallback) {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(this.key)) || fallback;
        } catch (error) {
            alert(error?.toString());
        }
        return data;
    }
};

alpine.data("state", () => ({
    init() {
        this.$watch("notes", (state) => store.write(state));
    },

    notes: store.read([]),

    newnote: false,
    note: "",
    saveNote() {
        const note = { 
            n: this.note, 
            g: this.category,
            t: getTime()
        };
        if (!this.editing) {
            this.notes.push(note);
        } else {
            this.notes[this.editIndex] = note;
            this.editing = false;
        }
        this.note = "";
        this.newnote = false;
    },

    createNote() {
        this.newnote = true;
        this.category = 1;
        this.note = "";
    },
    
    cancelNote() {
        this.newnote = false;
        this.editing = false;
        this.note = "";
    },

    category: 0,
    categories: [
        { name: "All",      value: 0, color: "gray" },
        { name: "Personal", value: 1, color: "red" },
        { name: "Work",     value: 2, color: "blue" },
        { name: "Study",    value: 3, color: "green" },
        { name: "Family",   value: 4, color: "orange" },
        { name: "Other",    value: 5, color: "gray" },
    ],
    setCategory(v) {
        this.category = v;
        this.search = "";
    },
    
    search: "",

    get filteredNotes() {
        const c = this.category;
        const s = this.search;
        let result = this.notes;
        if (c != 0) result = result.filter(x => x.g == c);
        if (s.length) result = result.filter(x => new RegExp(`${s}`, "gi").test(x.n));
        return Array.from(result.reduce((all, v) => {
            let day = Math.floor(new Date(v.t).getTime()/(1000*60*60*24));
            if (all.has(day)) {
                all.get(day).push(v);
            } else {
                all.set(day, [v]);
            }
            return all;
        }, new Map()).entries()).sort((a, b) => b[0] - a[0]);
    },

    formatTime(d) {
        const diff = (getTime()/1000/60/60/24) - d;
        if (diff < 1) {
            return 'Today';
        } else if(diff == 1) {
            return 'Yesterday';
        }
        return new Date(d*1000*60*60*24).toLocaleDateString();
    },

    deleteNote(ts) {
        if (confirm("Do you want to delete this note?")) {
            this.notes.splice(this.notes.findIndex(n => n.t == ts), 1);
        }
    },

    editing: false,
    editIndex: null,
    editNote(ts) {
        this.editIndex = this.notes.findIndex(n => n.t == ts);
        const { n, g } = this.notes[this.editIndex];
        this.note = n;
        this.editing = true;
        this.newnote = true;
        this.category = g;
    }

}));

alpine.start();