// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_create_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EmployeeCreateDtoRoleEnum _$employeeCreateDtoRoleEnum_DRIVER =
    const EmployeeCreateDtoRoleEnum._('DRIVER');
const EmployeeCreateDtoRoleEnum _$employeeCreateDtoRoleEnum_TICKET_STAFF =
    const EmployeeCreateDtoRoleEnum._('TICKET_STAFF');
const EmployeeCreateDtoRoleEnum _$employeeCreateDtoRoleEnum_SUPPORT_STAFF =
    const EmployeeCreateDtoRoleEnum._('SUPPORT_STAFF');

EmployeeCreateDtoRoleEnum _$employeeCreateDtoRoleEnumValueOf(String name) {
  switch (name) {
    case 'DRIVER':
      return _$employeeCreateDtoRoleEnum_DRIVER;
    case 'TICKET_STAFF':
      return _$employeeCreateDtoRoleEnum_TICKET_STAFF;
    case 'SUPPORT_STAFF':
      return _$employeeCreateDtoRoleEnum_SUPPORT_STAFF;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeCreateDtoRoleEnum> _$employeeCreateDtoRoleEnumValues =
    BuiltSet<EmployeeCreateDtoRoleEnum>(const <EmployeeCreateDtoRoleEnum>[
  _$employeeCreateDtoRoleEnum_DRIVER,
  _$employeeCreateDtoRoleEnum_TICKET_STAFF,
  _$employeeCreateDtoRoleEnum_SUPPORT_STAFF,
]);

Serializer<EmployeeCreateDtoRoleEnum> _$employeeCreateDtoRoleEnumSerializer =
    _$EmployeeCreateDtoRoleEnumSerializer();

class _$EmployeeCreateDtoRoleEnumSerializer
    implements PrimitiveSerializer<EmployeeCreateDtoRoleEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRIVER': 'DRIVER',
    'TICKET_STAFF': 'TICKET_STAFF',
    'SUPPORT_STAFF': 'SUPPORT_STAFF',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRIVER': 'DRIVER',
    'TICKET_STAFF': 'TICKET_STAFF',
    'SUPPORT_STAFF': 'SUPPORT_STAFF',
  };

  @override
  final Iterable<Type> types = const <Type>[EmployeeCreateDtoRoleEnum];
  @override
  final String wireName = 'EmployeeCreateDtoRoleEnum';

  @override
  Object serialize(Serializers serializers, EmployeeCreateDtoRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeCreateDtoRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeCreateDtoRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeCreateDto extends EmployeeCreateDto {
  @override
  final String username;
  @override
  final String contactEmail;
  @override
  final EmployeeCreateDtoRoleEnum role;
  @override
  final String reason;

  factory _$EmployeeCreateDto(
          [void Function(EmployeeCreateDtoBuilder)? updates]) =>
      (EmployeeCreateDtoBuilder()..update(updates))._build();

  _$EmployeeCreateDto._(
      {required this.username,
      required this.contactEmail,
      required this.role,
      required this.reason})
      : super._();
  @override
  EmployeeCreateDto rebuild(void Function(EmployeeCreateDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeeCreateDtoBuilder toBuilder() =>
      EmployeeCreateDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeeCreateDto &&
        username == other.username &&
        contactEmail == other.contactEmail &&
        role == other.role &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, username.hashCode);
    _$hash = $jc(_$hash, contactEmail.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EmployeeCreateDto')
          ..add('username', username)
          ..add('contactEmail', contactEmail)
          ..add('role', role)
          ..add('reason', reason))
        .toString();
  }
}

class EmployeeCreateDtoBuilder
    implements Builder<EmployeeCreateDto, EmployeeCreateDtoBuilder> {
  _$EmployeeCreateDto? _$v;

  String? _username;
  String? get username => _$this._username;
  set username(String? username) => _$this._username = username;

  String? _contactEmail;
  String? get contactEmail => _$this._contactEmail;
  set contactEmail(String? contactEmail) => _$this._contactEmail = contactEmail;

  EmployeeCreateDtoRoleEnum? _role;
  EmployeeCreateDtoRoleEnum? get role => _$this._role;
  set role(EmployeeCreateDtoRoleEnum? role) => _$this._role = role;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  EmployeeCreateDtoBuilder() {
    EmployeeCreateDto._defaults(this);
  }

  EmployeeCreateDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _username = $v.username;
      _contactEmail = $v.contactEmail;
      _role = $v.role;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EmployeeCreateDto other) {
    _$v = other as _$EmployeeCreateDto;
  }

  @override
  void update(void Function(EmployeeCreateDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeeCreateDto build() => _build();

  _$EmployeeCreateDto _build() {
    final _$result = _$v ??
        _$EmployeeCreateDto._(
          username: BuiltValueNullFieldError.checkNotNull(
              username, r'EmployeeCreateDto', 'username'),
          contactEmail: BuiltValueNullFieldError.checkNotNull(
              contactEmail, r'EmployeeCreateDto', 'contactEmail'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'EmployeeCreateDto', 'role'),
          reason: BuiltValueNullFieldError.checkNotNull(
              reason, r'EmployeeCreateDto', 'reason'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
