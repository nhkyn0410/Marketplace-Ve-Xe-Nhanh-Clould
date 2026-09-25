// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const EmployeeListResponseDtoOutputItemsInnerRoleEnum
    _$employeeListResponseDtoOutputItemsInnerRoleEnum_DRIVER =
    const EmployeeListResponseDtoOutputItemsInnerRoleEnum._('DRIVER');
const EmployeeListResponseDtoOutputItemsInnerRoleEnum
    _$employeeListResponseDtoOutputItemsInnerRoleEnum_TICKET_STAFF =
    const EmployeeListResponseDtoOutputItemsInnerRoleEnum._('TICKET_STAFF');
const EmployeeListResponseDtoOutputItemsInnerRoleEnum
    _$employeeListResponseDtoOutputItemsInnerRoleEnum_SUPPORT_STAFF =
    const EmployeeListResponseDtoOutputItemsInnerRoleEnum._('SUPPORT_STAFF');

EmployeeListResponseDtoOutputItemsInnerRoleEnum
    _$employeeListResponseDtoOutputItemsInnerRoleEnumValueOf(String name) {
  switch (name) {
    case 'DRIVER':
      return _$employeeListResponseDtoOutputItemsInnerRoleEnum_DRIVER;
    case 'TICKET_STAFF':
      return _$employeeListResponseDtoOutputItemsInnerRoleEnum_TICKET_STAFF;
    case 'SUPPORT_STAFF':
      return _$employeeListResponseDtoOutputItemsInnerRoleEnum_SUPPORT_STAFF;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeListResponseDtoOutputItemsInnerRoleEnum>
    _$employeeListResponseDtoOutputItemsInnerRoleEnumValues = BuiltSet<
        EmployeeListResponseDtoOutputItemsInnerRoleEnum>(const <EmployeeListResponseDtoOutputItemsInnerRoleEnum>[
  _$employeeListResponseDtoOutputItemsInnerRoleEnum_DRIVER,
  _$employeeListResponseDtoOutputItemsInnerRoleEnum_TICKET_STAFF,
  _$employeeListResponseDtoOutputItemsInnerRoleEnum_SUPPORT_STAFF,
]);

const EmployeeListResponseDtoOutputItemsInnerStatusEnum
    _$employeeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE =
    const EmployeeListResponseDtoOutputItemsInnerStatusEnum._('ACTIVE');
const EmployeeListResponseDtoOutputItemsInnerStatusEnum
    _$employeeListResponseDtoOutputItemsInnerStatusEnum_LOCKED =
    const EmployeeListResponseDtoOutputItemsInnerStatusEnum._('LOCKED');
const EmployeeListResponseDtoOutputItemsInnerStatusEnum
    _$employeeListResponseDtoOutputItemsInnerStatusEnum_DISABLED =
    const EmployeeListResponseDtoOutputItemsInnerStatusEnum._('DISABLED');

EmployeeListResponseDtoOutputItemsInnerStatusEnum
    _$employeeListResponseDtoOutputItemsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$employeeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
    case 'LOCKED':
      return _$employeeListResponseDtoOutputItemsInnerStatusEnum_LOCKED;
    case 'DISABLED':
      return _$employeeListResponseDtoOutputItemsInnerStatusEnum_DISABLED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<EmployeeListResponseDtoOutputItemsInnerStatusEnum>
    _$employeeListResponseDtoOutputItemsInnerStatusEnumValues = BuiltSet<
        EmployeeListResponseDtoOutputItemsInnerStatusEnum>(const <EmployeeListResponseDtoOutputItemsInnerStatusEnum>[
  _$employeeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE,
  _$employeeListResponseDtoOutputItemsInnerStatusEnum_LOCKED,
  _$employeeListResponseDtoOutputItemsInnerStatusEnum_DISABLED,
]);

Serializer<EmployeeListResponseDtoOutputItemsInnerRoleEnum>
    _$employeeListResponseDtoOutputItemsInnerRoleEnumSerializer =
    _$EmployeeListResponseDtoOutputItemsInnerRoleEnumSerializer();
Serializer<EmployeeListResponseDtoOutputItemsInnerStatusEnum>
    _$employeeListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$EmployeeListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$EmployeeListResponseDtoOutputItemsInnerRoleEnumSerializer
    implements
        PrimitiveSerializer<EmployeeListResponseDtoOutputItemsInnerRoleEnum> {
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
    EmployeeListResponseDtoOutputItemsInnerRoleEnum
  ];
  @override
  final String wireName = 'EmployeeListResponseDtoOutputItemsInnerRoleEnum';

  @override
  Object serialize(Serializers serializers,
          EmployeeListResponseDtoOutputItemsInnerRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeListResponseDtoOutputItemsInnerRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeListResponseDtoOutputItemsInnerRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<EmployeeListResponseDtoOutputItemsInnerStatusEnum> {
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
    EmployeeListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName = 'EmployeeListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          EmployeeListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  EmployeeListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      EmployeeListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$EmployeeListResponseDtoOutputItemsInner
    extends EmployeeListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String username;
  @override
  final String? contactEmail;
  @override
  final EmployeeListResponseDtoOutputItemsInnerRoleEnum role;
  @override
  final EmployeeListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final bool credentialDeliveryPending;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$EmployeeListResponseDtoOutputItemsInner(
          [void Function(EmployeeListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (EmployeeListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$EmployeeListResponseDtoOutputItemsInner._(
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
  EmployeeListResponseDtoOutputItemsInner rebuild(
          void Function(EmployeeListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeeListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      EmployeeListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeeListResponseDtoOutputItemsInner &&
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
    return (newBuiltValueToStringHelper(
            r'EmployeeListResponseDtoOutputItemsInner')
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

class EmployeeListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<EmployeeListResponseDtoOutputItemsInner,
            EmployeeListResponseDtoOutputItemsInnerBuilder> {
  _$EmployeeListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _username;
  String? get username => _$this._username;
  set username(String? username) => _$this._username = username;

  String? _contactEmail;
  String? get contactEmail => _$this._contactEmail;
  set contactEmail(String? contactEmail) => _$this._contactEmail = contactEmail;

  EmployeeListResponseDtoOutputItemsInnerRoleEnum? _role;
  EmployeeListResponseDtoOutputItemsInnerRoleEnum? get role => _$this._role;
  set role(EmployeeListResponseDtoOutputItemsInnerRoleEnum? role) =>
      _$this._role = role;

  EmployeeListResponseDtoOutputItemsInnerStatusEnum? _status;
  EmployeeListResponseDtoOutputItemsInnerStatusEnum? get status =>
      _$this._status;
  set status(EmployeeListResponseDtoOutputItemsInnerStatusEnum? status) =>
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

  EmployeeListResponseDtoOutputItemsInnerBuilder() {
    EmployeeListResponseDtoOutputItemsInner._defaults(this);
  }

  EmployeeListResponseDtoOutputItemsInnerBuilder get _$this {
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
  void replace(EmployeeListResponseDtoOutputItemsInner other) {
    _$v = other as _$EmployeeListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(EmployeeListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeeListResponseDtoOutputItemsInner build() => _build();

  _$EmployeeListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$EmployeeListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'EmployeeListResponseDtoOutputItemsInner', 'id'),
          username: BuiltValueNullFieldError.checkNotNull(
              username, r'EmployeeListResponseDtoOutputItemsInner', 'username'),
          contactEmail: contactEmail,
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'EmployeeListResponseDtoOutputItemsInner', 'role'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'EmployeeListResponseDtoOutputItemsInner', 'status'),
          credentialDeliveryPending: BuiltValueNullFieldError.checkNotNull(
              credentialDeliveryPending,
              r'EmployeeListResponseDtoOutputItemsInner',
              'credentialDeliveryPending'),
          createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
              r'EmployeeListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(updatedAt,
              r'EmployeeListResponseDtoOutputItemsInner', 'updatedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
