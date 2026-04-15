package com.gradquest.web;

import com.gradquest.service.TeacherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/students")
    public Object getStudentDashboard() {
        return ApiResponses.ok(teacherService.getDashboard());
    }

    @GetMapping("/students/{studentId}")
    public Object getStudentDetail(@PathVariable long studentId) {
        return ApiResponses.ok(teacherService.getStudentDetail(studentId));
    }
}
