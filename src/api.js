const API_URL = process.env.REACT_APP_API_URL;

console.log("================================");
console.log("[API] REACT_APP_API_URL:", API_URL);
console.log("================================");


if (!API_URL) {
    console.error(
        "REACT_APP_API_URL이 설정되지 않았습니다."
    );
}


// =====================================================
// 공통 API 요청
// =====================================================

async function request(path, options = {}) {

    if (!API_URL) {
        throw new Error(
            "REACT_APP_API_URL이 설정되지 않았습니다."
        );
    }


    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    if (!response.ok) {

        let message = "";

        try {
            message = await response.text();
        } catch {
            message = "";
        }


        throw new Error(
            `API 요청 실패: ${response.status} ${response.statusText}` +
            (message ? ` - ${message}` : "")
        );

    }


    // 응답이 없는 경우

    if (response.status === 204) {
        return null;
    }


    const text = await response.text();


    if (!text) {
        return null;
    }


    try {

        return JSON.parse(text);

    } catch {

        return text;

    }

}


// =====================================================
// 학생 목록
// POST /api/list
// =====================================================

export async function getStudents() {

    return request("/list", {

        method: "POST",

        body: JSON.stringify({})

    });

}


// =====================================================
// 학생 정보
// GET /api/student?id=21
// =====================================================

export async function getStudent(id) {

    return request(
        `/student?id=${encodeURIComponent(id)}`,
        {
            method: "GET"
        }
    );

}


// =====================================================
// 선택 과목
// POST /api/subject
// =====================================================

export async function getSubjects(id) {

    return request("/subject", {

        method: "POST",

        body: JSON.stringify({
            id: Number(id)
        })

    });

}


// =====================================================
// 시간표
// POST /api/timetable
// =====================================================

export async function getTimetable(id) {

    return request("/timetable", {

        method: "POST",

        body: JSON.stringify({
            id: Number(id)
        })

    });

}


// =====================================================
// 좌석 조회
// POST /api/seats
// =====================================================

export async function getSeats() {

    return request("/seats", {

        method: "POST"

    });

}


// =====================================================
// 좌석 저장
// POST /api/updateSeat
//
// Spring:
//
// @RequestBody Map<String, String[][]> req
//
// 전송:
//
// {
//     "seats": [
//         [...],
//         [...]
//     ]
// }
// =====================================================

export async function updateSeats(seats) {

    if (
        !Array.isArray(seats) ||
        seats.length !== 5 ||
        seats.some(
            row =>
                !Array.isArray(row) ||
                row.length !== 5
        )
    ) {

        throw new Error(
            "좌석 데이터는 5x5 배열이어야 합니다."
        );

    }


    return request("/updateSeat", {

        method: "POST",

        body: JSON.stringify({
            seats: seats
        })

    });

}