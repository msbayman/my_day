from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db import models
from .models import User
from Diary_todo.models import Diary, Todo
from datetime import timedelta


# Inline for Diaries in User admin
class DiaryInline(admin.TabularInline):
    """Inline admin for managing diaries within user profile"""
    model = Diary
    extra = 1
    fields = ('text',)
    readonly_fields = ('pub_date',)
    show_change_link = True
    
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 2, 'cols': 40})},
    }


# Inline for Todos in User admin
class TodoInlineForUser(admin.TabularInline):
    """Inline admin for managing todos directly under user"""
    model = Todo
    extra = 2
    fields = ('title', 'start_time', 'end_time', 'status')
    show_change_link = True


# Custom User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model with direct diary and todo management"""
    list_display = (
        'email', 'username', 'first_name', 'last_name',
        'diary_count', 'todo_count', 'is_staff', 'two_fa', 'date_joined'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'two_fa', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [DiaryInline, TodoInlineForUser]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'username')}),
        ('Security', {'fields': ('two_fa',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email', 'username', 'password1', 'password2', 'two_fa')}),
    )

    def diary_count(self, obj):
        return obj.diaries.count()
    diary_count.short_description = 'Diaries'

    def todo_count(self, obj):
        return obj.todos.count()
    todo_count.short_description = 'Todos'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('diaries', 'todos')


# Diary Admin
@admin.register(Diary)
class DiaryAdmin(admin.ModelAdmin):
    """Admin for Diary model"""
    list_display = ('user_info', 'pub_date', 'text_preview', 'user_todo_count')
    list_filter = ('pub_date', 'user__is_staff', 'user')
    search_fields = ('user__email', 'user__username', 'text')
    date_hierarchy = 'pub_date'
    ordering = ('-pub_date',)
    fields = ('user', 'text')
    readonly_fields = ('pub_date',)

    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 8, 'cols': 80})},
    }

    def user_info(self, obj):
        return f"{obj.user.email} ({obj.user.username})"
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'

    def text_preview(self, obj):
        return obj.text[:80] + '...' if len(obj.text) > 80 else obj.text
    text_preview.short_description = 'Content Preview'

    def user_todo_count(self, obj):
        return obj.user.todos.count()
    user_todo_count.short_description = 'User Todos'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user').prefetch_related('user__todos')


# Todo Admin
@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    """Admin for Todo model with DateTime support"""
    list_display = ('title', 'user_info', 'time_range', 'status', 'duration_display')
    list_filter = ('status', 'user')
    search_fields = ('title', 'description', 'user__email', 'user__username')
    ordering = ('user', '-start_time')
    fields = ('user', 'title', 'description', 'start_time', 'end_time', 'status')

    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 3, 'cols': 60})},
    }

    def user_info(self, obj):
        return f"{obj.user.email} ({obj.user.username})"
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'

    def time_range(self, obj):
        """Show start and end datetime safely"""
        if obj.start_time and obj.end_time:
            return f"{obj.start_time.strftime('%Y-%m-%d %H:%M')} → {obj.end_time.strftime('%Y-%m-%d %H:%M')}"
        elif obj.start_time:
            return f"Starts: {obj.start_time.strftime('%Y-%m-%d %H:%M')}"
        elif obj.end_time:
            return f"Ends: {obj.end_time.strftime('%Y-%m-%d %H:%M')}"
        return "No time set"
    time_range.short_description = "Time Range"


    def duration_display(self, obj):
        """Show duration only if both times exist"""
        if not obj.start_time or not obj.end_time:
            return "—"
        duration = obj.end_time - obj.start_time
        if duration.total_seconds() < 0:
            from datetime import timedelta
            duration += timedelta(days=1)
        hours, remainder = divmod(duration.total_seconds(), 3600)
        minutes, _ = divmod(remainder, 60)
        return f"{int(hours)}h {int(minutes)}m"
    duration_display.short_description = "Duration"


    actions = ['mark_completed', 'mark_in_progress', 'mark_not_started']

    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f"{updated} todos marked as completed.")
    mark_completed.short_description = "Mark selected todos as completed"

    def mark_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f"{updated} todos marked as in progress.")
    mark_in_progress.short_description = "Mark selected todos as in progress"

    def mark_not_started(self, request, queryset):
        updated = queryset.update(status='not_started')
        self.message_user(request, f"{updated} todos marked as not started.")
    mark_not_started.short_description = "Mark selected todos as not started"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')


# Admin site customization
admin.site.site_header = "My Day Admin Panel"
admin.site.site_title = "My Day Admin"
admin.site.index_title = "Manage Users, Diaries & Todos"
