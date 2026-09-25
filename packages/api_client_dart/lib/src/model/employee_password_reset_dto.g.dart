// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_password_reset_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EmployeePasswordResetDto extends EmployeePasswordResetDto {
  @override
  final String reason;

  factory _$EmployeePasswordResetDto(
          [void Function(EmployeePasswordResetDtoBuilder)? updates]) =>
      (EmployeePasswordResetDtoBuilder()..update(updates))._build();

  _$EmployeePasswordResetDto._({required this.reason}) : super._();
  @override
  EmployeePasswordResetDto rebuild(
          void Function(EmployeePasswordResetDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeePasswordResetDtoBuilder toBuilder() =>
      EmployeePasswordResetDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeePasswordResetDto && reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EmployeePasswordResetDto')
          ..add('reason', reason))
        .toString();
  }
}

class EmployeePasswordResetDtoBuilder
    implements
        Builder<EmployeePasswordResetDto, EmployeePasswordResetDtoBuilder> {
  _$EmployeePasswordResetDto? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  EmployeePasswordResetDtoBuilder() {
    EmployeePasswordResetDto._defaults(this);
  }

  EmployeePasswordResetDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EmployeePasswordResetDto other) {
    _$v = other as _$EmployeePasswordResetDto;
  }

  @override
  void update(void Function(EmployeePasswordResetDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeePasswordResetDto build() => _build();

  _$EmployeePasswordResetDto _build() {
    final _$result = _$v ??
        _$EmployeePasswordResetDto._(
          reason: BuiltValueNullFieldError.checkNotNull(
              reason, r'EmployeePasswordResetDto', 'reason'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
