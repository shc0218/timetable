import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import {
    getStudents,
    getSubjects,
    getTimetable,
    getSeats
} from "./api";

import "./App.css";


// ======================================================
// 기본 설정
// ======================================================

const DAYS = ["월", "화", "수", "목", "금"];

const SUBJECT_CODES = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "L"
];

const PERIOD_COUNT = 7;


// ======================================================
// App
// ======================================================

function App() {

    // ==================================================
    // 페이지
    // ==================================================

    const [page, setPage] = useState("timetable");


    // ==================================================
    // 학생
    // ==================================================

    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");


    // ==================================================
    // 학생 데이터
    // ==================================================

    const [subjects, setSubjects] = useState({});
    const [timetable, setTimetable] = useState({});


    // ==================================================
    // 좌석
    // ==================================================

    const [seats, setSeats] = useState([]);


    // ==================================================
    // 상태
    // ==================================================

    const [loading, setLoading] = useState(true);
    const [studentLoading, setStudentLoading] = useState(false);
    const [seatLoading, setSeatLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // ==================================================
    // 캡처 영역
    // ==================================================

    const captureRef = useRef(null);


    // ==================================================
    // 선택된 학생
    // ==================================================

    const selectedStudent = useMemo(() => {

        if (!selectedStudentId) {
            return null;
        }

        return students.find(
            student =>
                String(student.id) ===
                String(selectedStudentId)
        );

    }, [
        students,
        selectedStudentId
    ]);


    // ==================================================
    // 학생 목록 조회
    // ==================================================

    useEffect(() => {

        const loadStudents = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getStudents();

                console.log(
                    "학생 목록:",
                    data
                );

                if (Array.isArray(data)) {

                    setStudents(data);

                } else {

                    console.warn(
                        "학생 목록 데이터 형식이 배열이 아닙니다.",
                        data
                    );

                    setStudents([]);

                }

            } catch (err) {

                console.error(
                    "학생 목록 조회 실패:",
                    err
                );

                setError(
                    "학생 목록을 불러오지 못했습니다."
                );

            } finally {

                setLoading(false);

            }

        };

        loadStudents();

    }, []);


    // ==================================================
    // 학생 선택
    // ==================================================

    const selectStudent = async (id) => {

        setSelectedStudentId(id);

        setSubjects({});
        setTimetable({});

        setError("");
        setMessage("");

        if (!id) {
            return;
        }

        try {

            setStudentLoading(true);


            // ------------------------------------------
            // 선택 과목
            // ------------------------------------------

            const subjectData =
                await getSubjects(id);

            console.log(
                "선택과목:",
                subjectData
            );


            // ------------------------------------------
            // 시간표
            // ------------------------------------------

            const timetableData =
                await getTimetable(id);

            console.log(
                "시간표:",
                timetableData
            );


            setSubjects(
                subjectData || {}
            );

            setTimetable(
                timetableData || {}
            );

        } catch (err) {

            console.error(
                "학생 정보 조회 실패:",
                err
            );

            setError(
                err.message ||
                "학생 정보를 불러오지 못했습니다."
            );

        } finally {

            setStudentLoading(false);

        }

    };


    // ==================================================
    // 좌석 조회
    // ==================================================

    const loadSeats = async () => {

        try {

            setSeatLoading(true);
            setError("");

            const data =
                await getSeats();

            console.log(
                "좌석 데이터:",
                data
            );

            setSeats(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "좌석 조회 실패:",
                err
            );

            setError(
                err.message ||
                "좌석 정보를 불러오지 못했습니다."
            );

        } finally {

            setSeatLoading(false);

        }

    };


    // ==================================================
    // 페이지 변경
    // ==================================================

    const changePage = (newPage) => {

        setPage(newPage);

        setError("");
        setMessage("");

        if (newPage === "seats") {

            loadSeats();

        }

    };


    // ==================================================
    // 시간표 데이터 가져오기
    // ==================================================

    const getTimetableCell = (
        day,
        periodIndex
    ) => {

        if (!timetable) {
            return null;
        }

        const dayData =
            timetable[day];

        if (!dayData) {
            return null;
        }


        // ------------------------------------------
        // 배열 형태
        // ------------------------------------------

        if (Array.isArray(dayData)) {

            return (
                dayData[periodIndex] ||
                null
            );

        }


        // ------------------------------------------
        // 객체 형태
        // ------------------------------------------

        return (
            dayData[periodIndex] ||
            dayData[String(periodIndex)] ||
            dayData[periodIndex + 1] ||
            dayData[String(periodIndex + 1)] ||
            null
        );

    };


    // ==================================================
    // 과목 이름 가져오기
    // ==================================================

    const getSubjectName = (cell) => {

        if (!cell) {
            return "";
        }


        // ------------------------------------------
        // 배열 형태
        //
        // ["수학", "1"]
        // ------------------------------------------

        if (Array.isArray(cell)) {

            return cell[0] || "";

        }


        // ------------------------------------------
        // 문자열
        // ------------------------------------------

        if (typeof cell === "string") {

            if (
                subjects[cell] &&
                Array.isArray(subjects[cell])
            ) {

                return subjects[cell][0];

            }

            return cell;

        }


        // ------------------------------------------
        // 객체
        // ------------------------------------------

        if (typeof cell === "object") {

            if (cell.name) {
                return cell.name;
            }

            if (cell.subject) {
                return cell.subject;
            }

            if (cell.code) {

                const subject =
                    subjects[cell.code];

                if (
                    Array.isArray(subject)
                ) {

                    return subject[0];

                }

                if (
                    typeof subject ===
                    "string"
                ) {

                    return subject;

                }

                return cell.code;

            }

        }

        return "";

    };


    // ==================================================
    // 반 정보 가져오기
    // ==================================================

    const getClassName = (cell) => {

        if (!cell) {
            return "";
        }


        if (Array.isArray(cell)) {

            return cell[1] || "";

        }


        if (
            typeof cell === "object"
        ) {

            return (
                cell.className ||
                cell.class ||
                cell.room ||
                ""
            );

        }


        return "";

    };


    // ==================================================
    // 시간표 이미지 저장
    // ==================================================

    const saveTimetableImage = async () => {

        if (!selectedStudentId) {

            setError(
                "학생을 먼저 선택해주세요."
            );

            return;

        }


        if (!captureRef.current) {

            setError(
                "시간표 캡처 영역을 찾을 수 없습니다."
            );

            return;

        }


        try {

            setSaving(true);
            setError("");
            setMessage("");


            // ------------------------------------------
            // 캡처 영역
            // ------------------------------------------

            const element =
                captureRef.current;


            // ------------------------------------------
            // 캡처
            // ------------------------------------------

            const canvas =
                await html2canvas(
                    element,
                    {
                        scale: 2,

                        backgroundColor:
                            "#ffffff",

                        useCORS: true,

                        logging: false,

                        scrollX: 0,

                        scrollY: 0
                    }
                );


            // ------------------------------------------
            // 이미지 생성
            // ------------------------------------------

            const image =
                canvas.toDataURL(
                    "image/png"
                );


            // ------------------------------------------
            // 파일명
            // ------------------------------------------

            const studentName =
                selectedStudent?.name ||
                "학생";


            const safeName =
                studentName.replace(
                    /[\\/:*?"<>|]/g,
                    "_"
                );


            const filename =
                `${safeName}_시간표.png`;


            // ------------------------------------------
            // 다운로드
            // ------------------------------------------

            const link =
                document.createElement("a");

            link.href = image;

            link.download =
                filename;

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );


            setMessage(
                "시간표 이미지가 저장되었습니다."
            );

        } catch (err) {

            console.error(
                "시간표 캡처 실패:",
                err
            );

            setError(
                "시간표 이미지를 저장하지 못했습니다."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==================================================
    // 전체 시간표 캡처 영역
    // ==================================================

    const renderCaptureTimetable = () => {

        return (

            <div
                ref={captureRef}
                className="timetable-capture"
            >

                <div className="capture-title">

                    <h1>
                        학생 시간표
                    </h1>

                    <h2>
                        {
                            selectedStudent?.name ||
                            "학생"
                        }
                    </h2>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                교시
                            </th>

                            {DAYS.map(
                                day => (

                                    <th key={day}>
                                        {day}
                                    </th>

                                )
                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {Array.from(
                            {
                                length:
                                    PERIOD_COUNT
                            },
                            (_, periodIndex) => (

                                <tr
                                    key={
                                        periodIndex
                                    }
                                >

                                    <th>

                                        {
                                            periodIndex +
                                            1
                                        }

                                        교시

                                    </th>


                                    {DAYS.map(
                                        day => {

                                            const cell =
                                                getTimetableCell(
                                                    day,
                                                    periodIndex
                                                );


                                            const subjectName =
                                                getSubjectName(
                                                    cell
                                                );


                                            const className =
                                                getClassName(
                                                    cell
                                                );


                                            return (

                                                <td
                                                    key={
                                                        day
                                                    }
                                                >

                                                    {subjectName ? (

                                                        <>

                                                            <div className="capture-subject">

                                                                {
                                                                    subjectName
                                                                }

                                                            </div>


                                                            {className && (

                                                                <div className="capture-class">

                                                                    {
                                                                        className
                                                                    }

                                                                    반

                                                                </div>

                                                            )}

                                                        </>

                                                    ) : (

                                                        <span className="empty-cell">

                                                            -

                                                        </span>

                                                    )}

                                                </td>

                                            );

                                        }
                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>


                <div className="capture-footer">

                    Class Database

                </div>

            </div>

        );

    };


    // ==================================================
    // 로딩
    // ==================================================

    if (loading) {

        return (

            <div className="loading-screen">

                <div className="loading-box">

                    <div className="loading-spinner" />

                    <p>
                        학생 목록을 불러오는 중...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // 화면
    // ==================================================

    return (

        <div className="app">


            {/* ==========================================
                헤더
                ========================================== */}

            <header className="app-header">

                <div>

                    <h1>
                        학급 정보
                    </h1>

                    <p>
                        학생 시간표 및 좌석
                    </p>

                </div>

            </header>


            {/* ==========================================
                메뉴
                ========================================== */}

            <nav className="navigation">

                <button
                    className={
                        page === "timetable"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        changePage(
                            "timetable"
                        )
                    }
                >
                    시간표
                </button>


                <button
                    className={
                        page === "seats"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        changePage(
                            "seats"
                        )
                    }
                >
                    좌석
                </button>

            </nav>


            {/* ==========================================
                메시지
                ========================================== */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {message && (

                <div className="success-message">

                    {message}

                </div>

            )}


            {/* ==========================================
                시간표
                ========================================== */}

            {page === "timetable" && (

                <main className="content">


                    {/* 학생 선택 */}

                    <section className="card">

                        <div className="card-header">

                            <h2>
                                학생 선택
                            </h2>

                        </div>


                        <select
                            className="student-select"
                            value={
                                selectedStudentId
                            }
                            onChange={
                                event =>
                                    selectStudent(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="">

                                학생을 선택하세요

                            </option>


                            {students.map(
                                student => (

                                    <option
                                        key={
                                            student.id
                                        }
                                        value={
                                            student.id
                                        }
                                    >

                                        {
                                            student.name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </section>


                    {/* 학생 정보 */}

                    {selectedStudentId && (

                        <>

                            <section className="student-card">

                                <div>

                                    <span>
                                        선택된 학생
                                    </span>

                                    <h2>

                                        {
                                            selectedStudent?.name ||
                                            "학생"
                                        }

                                    </h2>

                                </div>

                            </section>


                            {/* 선택 과목 */}

                            <section className="card">

                                <div className="card-header">

                                    <h2>
                                        선택과목
                                    </h2>

                                </div>


                                {studentLoading ? (

                                    <div className="loading-inline">

                                        학생 정보를 불러오는 중...

                                    </div>

                                ) : (

                                    <div className="subject-table-wrapper">

                                        <table className="subject-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        코드
                                                    </th>

                                                    <th>
                                                        과목
                                                    </th>

                                                    <th>
                                                        반
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {SUBJECT_CODES.map(
                                                    code => {

                                                        const subject =
                                                            subjects?.[
                                                                code
                                                            ];


                                                        if (!subject) {
                                                            return null;
                                                        }


                                                        return (

                                                            <tr
                                                                key={
                                                                    code
                                                                }
                                                            >

                                                                <td>
                                                                    {
                                                                        code
                                                                    }
                                                                </td>

                                                                <td>

                                                                    {
                                                                        Array.isArray(
                                                                            subject
                                                                        )
                                                                            ? subject[0]
                                                                            : subject
                                                                    }

                                                                </td>

                                                                <td>

                                                                    {
                                                                        Array.isArray(
                                                                            subject
                                                                        )
                                                                            ? subject[1]
                                                                            : ""
                                                                    }

                                                                </td>

                                                            </tr>

                                                        );

                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>


                            {/* 시간표 */}

                            <section className="card">

                                <div className="card-header timetable-header">

                                    <h2>
                                        시간표
                                    </h2>


                                    <button
                                        className="save-button"
                                        onClick={
                                            saveTimetableImage
                                        }
                                        disabled={
                                            saving ||
                                            studentLoading
                                        }
                                    >

                                        {saving
                                            ? "이미지 생성 중..."
                                            : "📷 시간표 저장"
                                        }

                                    </button>

                                </div>


                                {studentLoading ? (

                                    <div className="loading-inline">

                                        시간표를 불러오는 중...

                                    </div>

                                ) : (

                                    <div className="timetable-wrapper">

                                        <table className="timetable">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        교시
                                                    </th>


                                                    {DAYS.map(
                                                        day => (

                                                            <th
                                                                key={
                                                                    day
                                                                }
                                                            >

                                                                {
                                                                    day
                                                                }

                                                            </th>

                                                        )
                                                    )}

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {Array.from(
                                                    {
                                                        length:
                                                            PERIOD_COUNT
                                                    },
                                                    (
                                                        _,
                                                        periodIndex
                                                    ) => (

                                                        <tr
                                                            key={
                                                                periodIndex
                                                            }
                                                        >

                                                            <th>

                                                                {
                                                                    periodIndex +
                                                                    1
                                                                }

                                                            </th>


                                                            {DAYS.map(
                                                                day => {

                                                                    const cell =
                                                                        getTimetableCell(
                                                                            day,
                                                                            periodIndex
                                                                        );


                                                                    const subjectName =
                                                                        getSubjectName(
                                                                            cell
                                                                        );


                                                                    const className =
                                                                        getClassName(
                                                                            cell
                                                                        );


                                                                    return (

                                                                        <td
                                                                            key={
                                                                                day
                                                                            }
                                                                        >

                                                                            {subjectName ? (

                                                                                <div className="timetable-cell">

                                                                                    <strong>

                                                                                        {
                                                                                            subjectName
                                                                                        }

                                                                                    </strong>


                                                                                    {className && (

                                                                                        <small>

                                                                                            {
                                                                                                className
                                                                                            }

                                                                                            반

                                                                                        </small>

                                                                                    )}

                                                                                </div>

                                                                            ) : (

                                                                                <span className="empty-cell">

                                                                                    -

                                                                                </span>

                                                                            )}

                                                                        </td>

                                                                    );

                                                                }
                                                            )}

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>

                        </>

                    )}

                </main>

            )}


            {/* ==========================================
                좌석
                ========================================== */}

            {page === "seats" && (

                <main className="content">

                    <section className="card">

                        <div className="card-header">

                            <h2>
                                좌석 배치
                            </h2>

                        </div>


                        {seatLoading ? (

                            <div className="loading-inline">

                                좌석 정보를 불러오는 중...

                            </div>

                        ) : seats.length === 0 ? (

                            <div className="empty-state">

                                좌석 정보가 없습니다.

                            </div>

                        ) : (

                            <div className="seat-grid">

                                {seats.map(
                                    (
                                        row,
                                        rowIndex
                                    ) => (

                                        <React.Fragment
                                            key={
                                                rowIndex
                                            }
                                        >

                                            {row.map(
                                                (
                                                    studentName,
                                                    columnIndex
                                                ) => {

                                                    const seatNumber =
                                                        rowIndex *
                                                        5 +
                                                        columnIndex +
                                                        1;


                                                    return (

                                                        <div
                                                            className="seat"
                                                            key={
                                                                columnIndex
                                                            }
                                                        >

                                                            <span className="seat-number">

                                                                {
                                                                    seatNumber
                                                                }

                                                            </span>


                                                            <span className="seat-name">

                                                                {
                                                                    studentName ||
                                                                    "빈자리"
                                                                }

                                                            </span>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </React.Fragment>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </main>

            )}


            {/* ==========================================
                캡처용 시간표

                화면 밖에 존재하지만 실제 렌더링되므로
                html2canvas가 캡처할 수 있음
                ========================================== */}

            <div
                className="capture-container"
            >

                {renderCaptureTimetable()}

            </div>

        </div>

    );

}

export default App;