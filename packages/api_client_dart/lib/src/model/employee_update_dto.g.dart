// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_update_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EmployeeUpdateDtoRoleEnum _$employeeUpdateDtoRoleEnum_DRIVER =
    const EmployeeUpdateDtoRoleEnum._('DRIVER');
const EmployeeUpdateDtoRoleEnum _$employeeUpdateDtoRoleEnum_TICKET_STAFF =
    const EmployeeUpdateDtoRoleEnum._('TICKET_STAFF');
const EmployeeUpdateDtoRoleEnum _$employeeUpdateDtoRoleEnum_SUPPORT_STAFF =
    const EmployeeUpdateDtoRoleEnum._('SUPPORT_STAFF');

EmployeeUpdateDtoRoleEnum _$employeeUpdateDtoRoleEnumValueOf(String name) {
  switch (name) {
    case 'DRIVER':
      return _$employeeUpdateDtoRoleEnum_DRIVER;
    case 'TICKET_STAFF':
      return _$employeeUpdateDtoRoleEnum_TICKET_STAFF;
    case 'SUPPORT_STAFF':
      return _$employeeUpdateDtoRoleEnum_SUPPORT_STAFF;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeUpdateDtoRoleEnum> _$employeeUpdateDtoRoleEnumValues =
    BuiltSet<EmployeeUpdateDtoRoleEnum>(const <EmployeeUpdateDtoRoleEnum>[
  _$employeeUpdateDtoRoleEnum_DRIVER,
  _$employeeUpdateDtoRoleEnum_TICKET_STAFF,
  _$employeeUpdateDtoRoleEnum_SUPPORT_STAFF,
]);

const EmployeeUpdateDtoStatusEnum _$employeeUpdateDtoStatusEnum_ACTIVE =
    const EmployeeUpdateDtoStatusEnum._('ACTIVE');
const EmployeeUpdateDtoStatusEnum _$employeeUpdateDtoStatusEnum_LOCKED =
    const EmployeeUpdateDtoStatusEnum._('LOCKED');
const EmployeeUpdateDtoStatusEnum _$employeeUpdateDtoStatusEnum_DISABLED =
    const EmployeeUpdateDtoStatusEnum._('DISABLED');

EmployeeUpdateDtoStatusEnum _$employeeUpdateDtoStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$employeeUpdateDtoStatusEnum_ACTIVE;
    case 'LOCKED':
      return _$employeeUpdateDtoStatusEnum_LOCKED;
    case 'DISABLED':
      return _$employeeUpdateDtoStatusEnum_DISABLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeUpdateDtoStatusEnum>
    _$employeeUpdateDtoStatusEnumValues =
    BuiltSet<EmployeeUpdateDtoStatusEnum>(const <EmployeeUpdateDtoStatusEnum>[
  _$employeeUpdateDtoStatusEnum_ACTIVE,
  _$employeeUpdateDtoStatusEnum_LOCKED,
  _$employeeUpdateDtoStatusEnum_DISABLED,
]);

Serializer<EmployeeUpdateDtoRoleEnum> _$employeeUpdateDtoRoleEnumSerializer =
    _$EmployeeUpdateDtoRoleEnumSerializer();
Serializer<EmployeeUpdateDtoStatusEnum>
    _$employeeUpdateDtoStatusEnumSerializer =
    _$EmployeeUpdateDtoStatusEnumSerializer();

class _$EmployeeUpdateDtoRoleEnumSerializer
    implements PrimitiveSerializer<EmployeeUpdateDtoRoleEnum> {
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
  final Iterable<Type> types = const <Type>[EmployeeUpdateDtoRoleEnum];
  @override
  final String wireName = 'EmployeeUpdateDtoRoleEnum';

  @override
  Object serialize(Serializers serializers, EmployeeUpdateDtoRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeUpdateDtoRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeUpdateDtoRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeUpdateDtoStatusEnumSerializer
    implements PrimitiveSerializer<EmployeeUpdateDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'LOCKED': 'LOCKED',
    'DISABLED': 'DISABLED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'LOCKED': 'LOCKED',
    'DISABLED': 'DISABLED',
  };

  @override
  final Iterable<Type> types = const <Type>[EmployeeUpdateDtoStatusEnum];
  @override
  final String wireName = 'EmployeeUpdateDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, EmployeeUpdateDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeUpdateDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeUpdateDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeUpdateDto extends EmployeeUpdateDto {
  @override
  final String? username;
  @override
  final String? contactEmail;
  @override
  final EmployeeUpdateDtoRoleEnum? role;
  @override
  final EmployeeUpdateDtoStatusEnum? status;
  @override
  final String reason;

  factory _$EmployeeUpdateDto(
          [void Function(EmployeeUpdateDtoBuilder)? updates]) =>
      (EmployeeUpdateDtoBuilder()..update(updates))._build();

  _$EmployeeUpdateDto._(
      {this.username,
      this.contactEmail,
      this.role,
      this.status,
      required this.reason})
      : super._();
  @override
  EmployeeUpdateDto rebuild(void Function(EmployeeUpdateDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeeUpdateDtoBuilder toBuilder() =>
      EmployeeUpdateDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeeUpdateDto &&
        username == other.username &&
        contactEmail == other.contactEmail &&
        role == other.role &&
        status == other.status &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, username.hashCode);
    _$hash = $jc(_$hash, contactEmail.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EmployeeUpdateDto')
          ..add('username', username)
          ..add('contactEmail', contactEmail)
          ..add('role', role)
          ..add('status', status)
          ..add('reason', reason))
        .toString();
  }
}

class EmployeeUpdateDtoBuilder
    implements Builder<EmployeeUpdateDto, EmployeeUpdateDtoBuilder> {
  _$EmployeeUpdateDto? _$v;

  String? _username;
  String? get username => _$this._username;
  set username(String? username) => _$this._username = username;

  String? _contactEmail;
  String? get contactEmail => _$this._contactEmail;
  set contactEmail(String? contactEmail) => _$this._contactEmail = contactEmail;

  EmployeeUpdateDtoRoleEnum? _role;
  EmployeeUpdateDtoRoleEnum? get role => _$this._role;
  set role(EmployeeUpdateDtoRoleEnum? role) => _$this._role = role;

  EmployeeUpdateDtoStatusEnum? _status;
  EmployeeUpdateDtoStatusEnum? get status => _$this._status;
  set status(EmployeeUpdateDtoStatusEnum? status) => _$this._status = status;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  EmployeeUpdateDtoBuilder() {
    EmployeeUpdateDto._defaults(this);
  }

  EmployeeUpdateDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _username = $v.username;
      _contactEmail = $v.contactEmail;
      _role = $v.role;
      _status = $v.status;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EmployeeUpdateDto other) {
    _$v = other as _$EmployeeUpdateDto;
  }

  @override
  void update(void Function(EmployeeUpdateDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeeUpdateDto build() => _build();

  _$EmployeeUpdateDto _build() {
    final _$result = _$v ??
        _$EmployeeUpdateDto._(
          username: username,
          contactEmail: contactEmail,
          role: role,
          status: status,
          reason: BuiltValueNullFieldError.checkNotNull(
              reason, r'EmployeeUpdateDto', 'reason'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
