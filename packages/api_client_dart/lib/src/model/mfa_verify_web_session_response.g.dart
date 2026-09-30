// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_verify_web_session_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MfaVerifyWebSessionResponseAuthenticatedEnum
    _$mfaVerifyWebSessionResponseAuthenticatedEnum_true_ =
    const MfaVerifyWebSessionResponseAuthenticatedEnum._('true_');

MfaVerifyWebSessionResponseAuthenticatedEnum
    _$mfaVerifyWebSessionResponseAuthenticatedEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$mfaVerifyWebSessionResponseAuthenticatedEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyWebSessionResponseAuthenticatedEnum>
    _$mfaVerifyWebSessionResponseAuthenticatedEnumValues = BuiltSet<
        MfaVerifyWebSessionResponseAuthenticatedEnum>(const <MfaVerifyWebSessionResponseAuthenticatedEnum>[
  _$mfaVerifyWebSessionResponseAuthenticatedEnum_true_,
]);

const MfaVerifyWebSessionResponseScopeEnum
    _$mfaVerifyWebSessionResponseScopeEnum_passenger =
    const MfaVerifyWebSessionResponseScopeEnum._('passenger');
const MfaVerifyWebSessionResponseScopeEnum
    _$mfaVerifyWebSessionResponseScopeEnum_operator_ =
    const MfaVerifyWebSessionResponseScopeEnum._('operator_');
const MfaVerifyWebSessionResponseScopeEnum
    _$mfaVerifyWebSessionResponseScopeEnum_platform =
    const MfaVerifyWebSessionResponseScopeEnum._('platform');

MfaVerifyWebSessionResponseScopeEnum
    _$mfaVerifyWebSessionResponseScopeEnumValueOf(String name) {
  switch (name) {
    case 'passenger':
      return _$mfaVerifyWebSessionResponseScopeEnum_passenger;
    case 'operator_':
      return _$mfaVerifyWebSessionResponseScopeEnum_operator_;
    case 'platform':
      return _$mfaVerifyWebSessionResponseScopeEnum_platform;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MfaVerifyWebSessionResponseScopeEnum>
    _$mfaVerifyWebSessionResponseScopeEnumValues = BuiltSet<
        MfaVerifyWebSessionResponseScopeEnum>(const <MfaVerifyWebSessionResponseScopeEnum>[
  _$mfaVerifyWebSessionResponseScopeEnum_passenger,
  _$mfaVerifyWebSessionResponseScopeEnum_operator_,
  _$mfaVerifyWebSessionResponseScopeEnum_platform,
]);

Serializer<MfaVerifyWebSessionResponseAuthenticatedEnum>
    _$mfaVerifyWebSessionResponseAuthenticatedEnumSerializer =
    _$MfaVerifyWebSessionResponseAuthenticatedEnumSerializer();
Serializer<MfaVerifyWebSessionResponseScopeEnum>
    _$mfaVerifyWebSessionResponseScopeEnumSerializer =
    _$MfaVerifyWebSessionResponseScopeEnumSerializer();

class _$MfaVerifyWebSessionResponseAuthenticatedEnumSerializer
    implements
        PrimitiveSerializer<MfaVerifyWebSessionResponseAuthenticatedEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MfaVerifyWebSessionResponseAuthenticatedEnum
  ];
  @override
  final String wireName = 'MfaVerifyWebSessionResponseAuthenticatedEnum';

  @override
  Object serialize(Serializers serializers,
          MfaVerifyWebSessionResponseAuthenticatedEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyWebSessionResponseAuthenticatedEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyWebSessionResponseAuthenticatedEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyWebSessionResponseScopeEnumSerializer
    implements PrimitiveSerializer<MfaVerifyWebSessionResponseScopeEnum> {
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
  final Iterable<Type> types = const <Type>[
    MfaVerifyWebSessionResponseScopeEnum
  ];
  @override
  final String wireName = 'MfaVerifyWebSessionResponseScopeEnum';

  @override
  Object serialize(
          Serializers serializers, MfaVerifyWebSessionResponseScopeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  MfaVerifyWebSessionResponseScopeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      MfaVerifyWebSessionResponseScopeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$MfaVerifyWebSessionResponse extends MfaVerifyWebSessionResponse {
  @override
  final MfaVerifyWebSessionResponseAuthenticatedEnum authenticated;
  @override
  final MfaVerifyWebSessionResponseScopeEnum scope;
  @override
  final String role;
  @override
  final int expiresIn;
  @override
  final int refreshExpiresIn;
  @override
  final BuiltList<String>? backupCodes;

  factory _$MfaVerifyWebSessionResponse(
          [void Function(MfaVerifyWebSessionResponseBuilder)? updates]) =>
      (MfaVerifyWebSessionResponseBuilder()..update(updates))._build();

  _$MfaVerifyWebSessionResponse._(
      {required this.authenticated,
      required this.scope,
      required this.role,
      required this.expiresIn,
      required this.refreshExpiresIn,
      this.backupCodes})
      : super._();
  @override
  MfaVerifyWebSessionResponse rebuild(
          void Function(MfaVerifyWebSessionResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MfaVerifyWebSessionResponseBuilder toBuilder() =>
      MfaVerifyWebSessionResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaVerifyWebSessionResponse &&
        authenticated == other.authenticated &&
        scope == other.scope &&
        role == other.role &&
        expiresIn == other.expiresIn &&
        refreshExpiresIn == other.refreshExpiresIn &&
        backupCodes == other.backupCodes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, authenticated.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, expiresIn.hashCode);
    _$hash = $jc(_$hash, refreshExpiresIn.hashCode);
    _$hash = $jc(_$hash, backupCodes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MfaVerifyWebSessionResponse')
          ..add('authenticated', authenticated)
          ..add('scope', scope)
          ..add('role', role)
          ..add('expiresIn', expiresIn)
          ..add('refreshExpiresIn', refreshExpiresIn)
          ..add('backupCodes', backupCodes))
        .toString();
  }
}

class MfaVerifyWebSessionResponseBuilder
    implements
        Builder<MfaVerifyWebSessionResponse,
            MfaVerifyWebSessionResponseBuilder> {
  _$MfaVerifyWebSessionResponse? _$v;

  MfaVerifyWebSessionResponseAuthenticatedEnum? _authenticated;
  MfaVerifyWebSessionResponseAuthenticatedEnum? get authenticated =>
      _$this._authenticated;
  set authenticated(
          MfaVerifyWebSessionResponseAuthenticatedEnum? authenticated) =>
      _$this._authenticated = authenticated;

  MfaVerifyWebSessionResponseScopeEnum? _scope;
  MfaVerifyWebSessionResponseScopeEnum? get scope => _$this._scope;
  set scope(MfaVerifyWebSessionResponseScopeEnum? scope) =>
      _$this._scope = scope;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  int? _expiresIn;
  int? get expiresIn => _$this._expiresIn;
  set expiresIn(int? expiresIn) => _$this._expiresIn = expiresIn;

  int? _refreshExpiresIn;
  int? get refreshExpiresIn => _$this._refreshExpiresIn;
  set refreshExpiresIn(int? refreshExpiresIn) =>
      _$this._refreshExpiresIn = refreshExpiresIn;

  ListBuilder<String>? _backupCodes;
  ListBuilder<String> get backupCodes =>
      _$this._backupCodes ??= ListBuilder<String>();
  set backupCodes(ListBuilder<String>? backupCodes) =>
      _$this._backupCodes = backupCodes;

  MfaVerifyWebSessionResponseBuilder() {
    MfaVerifyWebSessionResponse._defaults(this);
  }

  MfaVerifyWebSessionResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _authenticated = $v.authenticated;
      _scope = $v.scope;
      _role = $v.role;
      _expiresIn = $v.expiresIn;
      _refreshExpiresIn = $v.refreshExpiresIn;
      _backupCodes = $v.backupCodes?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaVerifyWebSessionResponse other) {
    _$v = other as _$MfaVerifyWebSessionResponse;
  }

  @override
  void update(void Function(MfaVerifyWebSessionResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaVerifyWebSessionResponse build() => _build();

  _$MfaVerifyWebSessionResponse _build() {
    _$MfaVerifyWebSessionResponse _$result;
    try {
      _$result = _$v ??
          _$MfaVerifyWebSessionResponse._(
            authenticated: BuiltValueNullFieldError.checkNotNull(
                authenticated, r'MfaVerifyWebSessionResponse', 'authenticated'),
            scope: BuiltValueNullFieldError.checkNotNull(
                scope, r'MfaVerifyWebSessionResponse', 'scope'),
            role: BuiltValueNullFieldError.checkNotNull(
                role, r'MfaVerifyWebSessionResponse', 'role'),
            expiresIn: BuiltValueNullFieldError.checkNotNull(
                expiresIn, r'MfaVerifyWebSessionResponse', 'expiresIn'),
            refreshExpiresIn: BuiltValueNullFieldError.checkNotNull(
                refreshExpiresIn,
                r'MfaVerifyWebSessionResponse',
                'refreshExpiresIn'),
            backupCodes: _backupCodes?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'backupCodes';
        _backupCodes?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'MfaVerifyWebSessionResponse', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
