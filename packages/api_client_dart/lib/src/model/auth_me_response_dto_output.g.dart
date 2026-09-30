// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_me_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AuthMeResponseDtoOutputScopeEnum
    _$authMeResponseDtoOutputScopeEnum_passenger =
    const AuthMeResponseDtoOutputScopeEnum._('passenger');
const AuthMeResponseDtoOutputScopeEnum
    _$authMeResponseDtoOutputScopeEnum_operator_ =
    const AuthMeResponseDtoOutputScopeEnum._('operator_');
const AuthMeResponseDtoOutputScopeEnum
    _$authMeResponseDtoOutputScopeEnum_platform =
    const AuthMeResponseDtoOutputScopeEnum._('platform');

AuthMeResponseDtoOutputScopeEnum _$authMeResponseDtoOutputScopeEnumValueOf(
    String name) {
  switch (name) {
    case 'passenger':
      return _$authMeResponseDtoOutputScopeEnum_passenger;
    case 'operator_':
      return _$authMeResponseDtoOutputScopeEnum_operator_;
    case 'platform':
      return _$authMeResponseDtoOutputScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AuthMeResponseDtoOutputScopeEnum>
    _$authMeResponseDtoOutputScopeEnumValues = BuiltSet<
        AuthMeResponseDtoOutputScopeEnum>(const <AuthMeResponseDtoOutputScopeEnum>[
  _$authMeResponseDtoOutputScopeEnum_passenger,
  _$authMeResponseDtoOutputScopeEnum_operator_,
  _$authMeResponseDtoOutputScopeEnum_platform,
]);

Serializer<AuthMeResponseDtoOutputScopeEnum>
    _$authMeResponseDtoOutputScopeEnumSerializer =
    _$AuthMeResponseDtoOutputScopeEnumSerializer();

class _$AuthMeResponseDtoOutputScopeEnumSerializer
    implements PrimitiveSerializer<AuthMeResponseDtoOutputScopeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'passenger': 'passenger',
    'operator_': 'operator',
    'platform': 'platform',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'passenger': 'passenger',
    'operator': 'operator_',
    'platform': 'platform',
  };

  @override
  final Iterable<Type> types = const <Type>[AuthMeResponseDtoOutputScopeEnum];
  @override
  final String wireName = 'AuthMeResponseDtoOutputScopeEnum';

  @override
  Object serialize(
          Serializers serializers, AuthMeResponseDtoOutputScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  AuthMeResponseDtoOutputScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      AuthMeResponseDtoOutputScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$AuthMeResponseDtoOutput extends AuthMeResponseDtoOutput {
  @override
  final String subjectId;
  @override
  final AuthMeResponseDtoOutputScopeEnum scope;
  @override
  final String role;
  @override
  final String username;
  @override
  final String sessionId;
  @override
  final DateTime accessExpiresAt;
  @override
  final bool mfaVerified;
  @override
  final String? operatorId;
  @override
  final String? operatorSlug;

  factory _$AuthMeResponseDtoOutput(
          [void Function(AuthMeResponseDtoOutputBuilder)? updates]) =>
      (AuthMeResponseDtoOutputBuilder()..update(updates))._build();

  _$AuthMeResponseDtoOutput._(
      {required this.subjectId,
      required this.scope,
      required this.role,
      required this.username,
      required this.sessionId,
      required this.accessExpiresAt,
      required this.mfaVerified,
      this.operatorId,
      this.operatorSlug})
      : super._();
  @override
  AuthMeResponseDtoOutput rebuild(
          void Function(AuthMeResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuthMeResponseDtoOutputBuilder toBuilder() =>
      AuthMeResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuthMeResponseDtoOutput &&
        subjectId == other.subjectId &&
        scope == other.scope &&
        role == other.role &&
        username == other.username &&
        sessionId == other.sessionId &&
        accessExpiresAt == other.accessExpiresAt &&
        mfaVerified == other.mfaVerified &&
        operatorId == other.operatorId &&
        operatorSlug == other.operatorSlug;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, subjectId.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, username.hashCode);
    _$hash = $jc(_$hash, sessionId.hashCode);
    _$hash = $jc(_$hash, accessExpiresAt.hashCode);
    _$hash = $jc(_$hash, mfaVerified.hashCode);
    _$hash = $jc(_$hash, operatorId.hashCode);
    _$hash = $jc(_$hash, operatorSlug.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuthMeResponseDtoOutput')
          ..add('subjectId', subjectId)
          ..add('scope', scope)
          ..add('role', role)
          ..add('username', username)
          ..add('sessionId', sessionId)
          ..add('accessExpiresAt', accessExpiresAt)
          ..add('mfaVerified', mfaVerified)
          ..add('operatorId', operatorId)
          ..add('operatorSlug', operatorSlug))
        .toString();
  }
}

class AuthMeResponseDtoOutputBuilder
    implements
        Builder<AuthMeResponseDtoOutput, AuthMeResponseDtoOutputBuilder> {
  _$AuthMeResponseDtoOutput? _$v;

  String? _subjectId;
  String? get subjectId => _$this._subjectId;
  set subjectId(String? subjectId) => _$this._subjectId = subjectId;

  AuthMeResponseDtoOutputScopeEnum? _scope;
  AuthMeResponseDtoOutputScopeEnum? get scope => _$this._scope;
  set scope(AuthMeResponseDtoOutputScopeEnum? scope) => _$this._scope = scope;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  String? _username;
  String? get username => _$this._username;
  set username(String? username) => _$this._username = username;

  String? _sessionId;
  String? get sessionId => _$this._sessionId;
  set sessionId(String? sessionId) => _$this._sessionId = sessionId;

  DateTime? _accessExpiresAt;
  DateTime? get accessExpiresAt => _$this._accessExpiresAt;
  set accessExpiresAt(DateTime? accessExpiresAt) =>
      _$this._accessExpiresAt = accessExpiresAt;

  bool? _mfaVerified;
  bool? get mfaVerified => _$this._mfaVerified;
  set mfaVerified(bool? mfaVerified) => _$this._mfaVerified = mfaVerified;

  String? _operatorId;
  String? get operatorId => _$this._operatorId;
  set operatorId(String? operatorId) => _$this._operatorId = operatorId;

  String? _operatorSlug;
  String? get operatorSlug => _$this._operatorSlug;
  set operatorSlug(String? operatorSlug) => _$this._operatorSlug = operatorSlug;

  AuthMeResponseDtoOutputBuilder() {
    AuthMeResponseDtoOutput._defaults(this);
  }

  AuthMeResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _subjectId = $v.subjectId;
      _scope = $v.scope;
      _role = $v.role;
      _username = $v.username;
      _sessionId = $v.sessionId;
      _accessExpiresAt = $v.accessExpiresAt;
      _mfaVerified = $v.mfaVerified;
      _operatorId = $v.operatorId;
      _operatorSlug = $v.operatorSlug;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuthMeResponseDtoOutput other) {
    _$v = other as _$AuthMeResponseDtoOutput;
  }

  @override
  void update(void Function(AuthMeResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuthMeResponseDtoOutput build() => _build();

  _$AuthMeResponseDtoOutput _build() {
    final _$result = _$v ??
        _$AuthMeResponseDtoOutput._(
          subjectId: BuiltValueNullFieldError.checkNotNull(
              subjectId, r'AuthMeResponseDtoOutput', 'subjectId'),
          scope: BuiltValueNullFieldError.checkNotNull(
              scope, r'AuthMeResponseDtoOutput', 'scope'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'AuthMeResponseDtoOutput', 'role'),
          username: BuiltValueNullFieldError.checkNotNull(
              username, r'AuthMeResponseDtoOutput', 'username'),
          sessionId: BuiltValueNullFieldError.checkNotNull(
              sessionId, r'AuthMeResponseDtoOutput', 'sessionId'),
          accessExpiresAt: BuiltValueNullFieldError.checkNotNull(
              accessExpiresAt, r'AuthMeResponseDtoOutput', 'accessExpiresAt'),
          mfaVerified: BuiltValueNullFieldError.checkNotNull(
              mfaVerified, r'AuthMeResponseDtoOutput', 'mfaVerified'),
          operatorId: operatorId,
          operatorSlug: operatorSlug,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
