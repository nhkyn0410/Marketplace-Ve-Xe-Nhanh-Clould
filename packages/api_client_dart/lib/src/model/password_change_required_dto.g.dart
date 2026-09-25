// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_change_required_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PasswordChangeRequiredDto extends PasswordChangeRequiredDto {
  @override
  final String passwordChangeToken;
  @override
  final String newPassword;

  factory _$PasswordChangeRequiredDto(
          [void Function(PasswordChangeRequiredDtoBuilder)? updates]) =>
      (PasswordChangeRequiredDtoBuilder()..update(updates))._build();

  _$PasswordChangeRequiredDto._(
      {required this.passwordChangeToken, required this.newPassword})
      : super._();
  @override
  PasswordChangeRequiredDto rebuild(
          void Function(PasswordChangeRequiredDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PasswordChangeRequiredDtoBuilder toBuilder() =>
      PasswordChangeRequiredDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordChangeRequiredDto &&
        passwordChangeToken == other.passwordChangeToken &&
        newPassword == other.newPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, passwordChangeToken.hashCode);
    _$hash = $jc(_$hash, newPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordChangeRequiredDto')
          ..add('passwordChangeToken', passwordChangeToken)
          ..add('newPassword', newPassword))
        .toString();
  }
}

class PasswordChangeRequiredDtoBuilder
    implements
        Builder<PasswordChangeRequiredDto, PasswordChangeRequiredDtoBuilder> {
  _$PasswordChangeRequiredDto? _$v;

  String? _passwordChangeToken;
  String? get passwordChangeToken => _$this._passwordChangeToken;
  set passwordChangeToken(String? passwordChangeToken) =>
      _$this._passwordChangeToken = passwordChangeToken;

  String? _newPassword;
  String? get newPassword => _$this._newPassword;
  set newPassword(String? newPassword) => _$this._newPassword = newPassword;

  PasswordChangeRequiredDtoBuilder() {
    PasswordChangeRequiredDto._defaults(this);
  }

  PasswordChangeRequiredDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _passwordChangeToken = $v.passwordChangeToken;
      _newPassword = $v.newPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordChangeRequiredDto other) {
    _$v = other as _$PasswordChangeRequiredDto;
  }

  @override
  void update(void Function(PasswordChangeRequiredDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordChangeRequiredDto build() => _build();

  _$PasswordChangeRequiredDto _build() {
    final _$result = _$v ??
        _$PasswordChangeRequiredDto._(
          passwordChangeToken: BuiltValueNullFieldError.checkNotNull(
              passwordChangeToken,
              r'PasswordChangeRequiredDto',
              'passwordChangeToken'),
          newPassword: BuiltValueNullFieldError.checkNotNull(
              newPassword, r'PasswordChangeRequiredDto', 'newPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
