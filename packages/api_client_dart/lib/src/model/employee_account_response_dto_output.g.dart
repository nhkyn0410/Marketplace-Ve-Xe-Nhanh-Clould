// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_account_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EmployeeAccountResponseDtoOutputRoleEnum
    _$employeeAccountResponseDtoOutputRoleEnum_DRIVER =
    const EmployeeAccountResponseDtoOutputRoleEnum._('DRIVER');
const EmployeeAccountResponseDtoOutputRoleEnum
    _$employeeAccountResponseDtoOutputRoleEnum_TICKET_STAFF =
    const EmployeeAccountResponseDtoOutputRoleEnum._('TICKET_STAFF');
const EmployeeAccountResponseDtoOutputRoleEnum
    _$employeeAccountResponseDtoOutputRoleEnum_SUPPORT_STAFF =
    const EmployeeAccountResponseDtoOutputRoleEnum._('SUPPORT_STAFF');

EmployeeAccountResponseDtoOutputRoleEnum
    _$employeeAccountResponseDtoOutputRoleEnumValueOf(String name) {
  switch (name) {
    case 'DRIVER':
      return _$employeeAccountResponseDtoOutputRoleEnum_DRIVER;
    case 'TICKET_STAFF':
      return _$employeeAccountResponseDtoOutputRoleEnum_TICKET_STAFF;
    case 'SUPPORT_STAFF':
      return _$employeeAccountResponseDtoOutputRoleEnum_SUPPORT_STAFF;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeAccountResponseDtoOutputRoleEnum>
    _$employeeAccountResponseDtoOutputRoleEnumValues = BuiltSet<
        EmployeeAccountResponseDtoOutputRoleEnum>(const <EmployeeAccountResponseDtoOutputRoleEnum>[
  _$employeeAccountResponseDtoOutputRoleEnum_DRIVER,
  _$employeeAccountResponseDtoOutputRoleEnum_TICKET_STAFF,
  _$employeeAccountResponseDtoOutputRoleEnum_SUPPORT_STAFF,
]);

const EmployeeAccountResponseDtoOutputStatusEnum
    _$employeeAccountResponseDtoOutputStatusEnum_ACTIVE =
    const EmployeeAccountResponseDtoOutputStatusEnum._('ACTIVE');
const EmployeeAccountResponseDtoOutputStatusEnum
    _$employeeAccountResponseDtoOutputStatusEnum_LOCKED =
    const EmployeeAccountResponseDtoOutputStatusEnum._('LOCKED');
const EmployeeAccountResponseDtoOutputStatusEnum
    _$employeeAccountResponseDtoOutputStatusEnum_DISABLED =
    const EmployeeAccountResponseDtoOutputStatusEnum._('DISABLED');

EmployeeAccountResponseDtoOutputStatusEnum
    _$employeeAccountResponseDtoOutputStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$employeeAccountResponseDtoOutputStatusEnum_ACTIVE;
    case 'LOCKED':
      return _$employeeAccountResponseDtoOutputStatusEnum_LOCKED;
    case 'DISABLED':
      return _$employeeAccountResponseDtoOutputStatusEnum_DISABLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeAccountResponseDtoOutputStatusEnum>
    _$employeeAccountResponseDtoOutputStatusEnumValues = BuiltSet<
        EmployeeAccountResponseDtoOutputStatusEnum>(const <EmployeeAccountResponseDtoOutputStatusEnum>[
  _$employeeAccountResponseDtoOutputStatusEnum_ACTIVE,
  _$employeeAccountResponseDtoOutputStatusEnum_LOCKED,
  _$employeeAccountResponseDtoOutputStatusEnum_DISABLED,
]);

Serializer<EmployeeAccountResponseDtoOutputRoleEnum>
    _$employeeAccountResponseDtoOutputRoleEnumSerializer =
    _$EmployeeAccountResponseDtoOutputRoleEnumSerializer();
Serializer<EmployeeAccountResponseDtoOutputStatusEnum>
    _$employeeAccountResponseDtoOutputStatusEnumSerializer =
    _$EmployeeAccountResponseDtoOutputStatusEnumSerializer();

class _$EmployeeAccountResponseDtoOutputRoleEnumSerializer
    implements PrimitiveSerializer<EmployeeAccountResponseDtoOutputRoleEnum> {
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
  final Iterable<Type> types = const <Type>[
    EmployeeAccountResponseDtoOutputRoleEnum
  ];
  @override
  final String wireName = 'EmployeeAccountResponseDtoOutputRoleEnum';

  @override
  Object serialize(Serializers serializers,
          EmployeeAccountResponseDtoOutputRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeAccountResponseDtoOutputRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeAccountResponseDtoOutputRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeAccountResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<EmployeeAccountResponseDtoOutputStatusEnum> {
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
  final Iterable<Type> types = const <Type>[
    EmployeeAccountResponseDtoOutputStatusEnum
  ];
  @override
  final String wireName = 'EmployeeAccountResponseDtoOutputStatusEnum';

  @override
  Object serialize(Serializers serializers,
          EmployeeAccountResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeAccountResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeAccountResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeAccountResponseDtoOutput
    extends EmployeeAccountResponseDtoOutput {
  @override
  final String id;
  @override
  final String username;
  @override
  final String? contactEmail;
  @override
  final EmployeeAccountResponseDtoOutputRoleEnum role;
  @override
  final EmployeeAccountResponseDtoOutputStatusEnum status;
  @override
  final bool credentialDeliveryPending;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$EmployeeAccountResponseDtoOutput(
          [void Function(EmployeeAccountResponseDtoOutputBuilder)? updates]) =>
      (EmployeeAccountResponseDtoOutputBuilder()..update(updates))._build();

  _$EmployeeAccountResponseDtoOutput._(
      {required this.id,
      required this.username,
      this.contactEmail,
      required this.role,
      required this.status,
      required this.credentialDeliveryPending,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  EmployeeAccountResponseDtoOutput rebuild(
          void Function(EmployeeAccountResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeeAccountResponseDtoOutputBuilder toBuilder() =>
      EmployeeAccountResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeeAccountResponseDtoOutput &&
        id == other.id &&
        username == other.username &&
        contactEmail == other.contactEmail &&
        role == other.role &&
        status == other.status &&
        credentialDeliveryPending == other.credentialDeliveryPending &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, username.hashCode);
    _$hash = $jc(_$hash, contactEmail.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, credentialDeliveryPending.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EmployeeAccountResponseDtoOutput')
          ..add('id', id)
          ..add('username', username)
          ..add('contactEmail', contactEmail)
          ..add('role', role)
          ..add('status', status)
          ..add('credentialDeliveryPending', credentialDeliveryPending)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class EmployeeAccountResponseDtoOutputBuilder
    implements
        Builder<EmployeeAccountResponseDtoOutput,
            EmployeeAccountResponseDtoOutputBuilder> {
  _$EmployeeAccountResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _username;
  String? get username => _$this._username;
  set username(String? username) => _$this._username = username;

  String? _contactEmail;
  String? get contactEmail => _$this._contactEmail;
  set contactEmail(String? contactEmail) => _$this._contactEmail = contactEmail;

  EmployeeAccountResponseDtoOutputRoleEnum? _role;
  EmployeeAccountResponseDtoOutputRoleEnum? get role => _$this._role;
  set role(EmployeeAccountResponseDtoOutputRoleEnum? role) =>
      _$this._role = role;

  EmployeeAccountResponseDtoOutputStatusEnum? _status;
  EmployeeAccountResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(EmployeeAccountResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  bool? _credentialDeliveryPending;
  bool? get credentialDeliveryPending => _$this._credentialDeliveryPending;
  set credentialDeliveryPending(bool? credentialDeliveryPending) =>
      _$this._credentialDeliveryPending = credentialDeliveryPending;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  EmployeeAccountResponseDtoOutputBuilder() {
    EmployeeAccountResponseDtoOutput._defaults(this);
  }

  EmployeeAccountResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _username = $v.username;
      _contactEmail = $v.contactEmail;
      _role = $v.role;
      _status = $v.status;
      _credentialDeliveryPending = $v.credentialDeliveryPending;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EmployeeAccountResponseDtoOutput other) {
    _$v = other as _$EmployeeAccountResponseDtoOutput;
  }

  @override
  void update(void Function(EmployeeAccountResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeeAccountResponseDtoOutput build() => _build();

  _$EmployeeAccountResponseDtoOutput _build() {
    final _$result = _$v ??
        _$EmployeeAccountResponseDtoOutput._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'EmployeeAccountResponseDtoOutput', 'id'),
          username: BuiltValueNullFieldError.checkNotNull(
              username, r'EmployeeAccountResponseDtoOutput', 'username'),
          contactEmail: contactEmail,
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'EmployeeAccountResponseDtoOutput', 'role'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'EmployeeAccountResponseDtoOutput', 'status'),
          credentialDeliveryPending: BuiltValueNullFieldError.checkNotNull(
              credentialDeliveryPending,
              r'EmployeeAccountResponseDtoOutput',
              'credentialDeliveryPending'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'EmployeeAccountResponseDtoOutput', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'EmployeeAccountResponseDtoOutput', 'updatedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
